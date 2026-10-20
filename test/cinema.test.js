const test = require('node:test');
const assert = require('node:assert/strict');
const { create_player } = require('../public/js/cinema-video');
const { motion_values, setup_scroll } = require('../public/js/cinema-scroll');

function fixture({ blocked = false, reduced = false, saveData = false, remembered = false, reload = false, delayedFrame = false } = {}) {
    const video = new EventTarget(), button = new EventTarget(), media = new EventTarget(), connection = new EventTarget(), page = new EventTarget();
    let calls = 0, assignments = 0, src = ''; const frames = [];
    Object.assign(video, { paused: true, hidden: true, currentTime: 0, style: {} });
    if (delayedFrame) video.requestVideoFrameCallback = fn => frames.push(fn);
    Object.defineProperty(video, 'src', { get: () => src, set: value => { src = value; assignments++; } });
    Object.assign(button, { hidden: true, dataset: {}, setAttribute: (key, value) => { button[key] = value; } });
    video.play = async () => { calls++; if (blocked) throw new Error('Blocked'); video.paused = false; video.dispatchEvent(new Event('playing')); };
    video.pause = () => { video.paused = true; video.dispatchEvent(new Event('pause')); };
    media.matches = reduced; connection.saveData = saveData;
    const values = new Map(remembered ? [['dreams_hero_video_started_v3', 'true']] : []);
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    const fallback = { hidden: false, src: 'poster' };
    const state = create_player({ video, button, fallback, storage, reduced: media, connection, page, navigation_type: reload ? 'reload' : 'navigate' });
    return { video, button, media, page, fallback, state, frames, calls: () => calls, assignments: () => assignments };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('cinema never requests video for reduced motion or save-data', () => {
    for (const options of [{ reduced: true }, { saveData: true }]) {
        const f = fixture(options);
        assert.equal(f.assignments(), 0); assert.equal(f.calls(), 0);
        assert.equal(f.fallback.hidden, false); assert.equal(f.video.hidden, true);
    }
});

test('autoplay failure preserves the visible poster and does not retry on scroll or return', async () => {
    const f = fixture({ blocked: true }); await settle();
    f.page.dispatchEvent(new Event('scroll')); f.page.dispatchEvent(new Event('pageshow'));
    assert.equal(f.calls(), 1); assert.equal(f.assignments(), 1);
    assert.equal(f.fallback.hidden, false); assert.equal(f.video.hidden, true); assert.equal(f.button.hidden, true);
});

test('pause, resume and double taps keep the same media source and playback position', async () => {
    const f = fixture(); await settle(); f.video.currentTime = 9;
    f.button.dispatchEvent(new Event('click')); assert.equal(f.video.paused, true);
    assert.equal(f.button['aria-label'], 'Continuar video');
    f.button.dispatchEvent(new Event('click')); f.button.dispatchEvent(new Event('click')); await settle();
    assert.equal(f.calls(), 2); assert.equal(f.assignments(), 1); assert.equal(f.video.currentTime, 9);
});

test('ended video stays at its actual last frame; session return is static and reload can replay once', async () => {
    const f = fixture(); await settle(); f.video.currentTime = 20; f.video.dispatchEvent(new Event('ended'));
    f.button.dispatchEvent(new Event('click')); f.page.dispatchEvent(new Event('scroll')); await settle();
    assert.equal(f.calls(), 1); assert.equal(f.assignments(), 1); assert.equal(f.video.currentTime, 20);
    assert.equal(f.video.hidden, false); assert.equal(f.button.hidden, true);
    const returned = fixture({ remembered: true }); assert.equal(returned.calls(), 0); assert.match(returned.fallback.src, /final.webp/);
    const reloaded = fixture({ remembered: true, reload: true }); await settle(); assert.equal(reloaded.calls(), 1);
});

test('media errors and preference changes restore a static frame without restarting', async () => {
    const failed = fixture(); await settle(); failed.video.dispatchEvent(new Event('error'));
    assert.equal(failed.video.hidden, true); assert.equal(failed.fallback.hidden, false);
    const f = fixture(); await settle(); f.media.matches = true; f.media.dispatchEvent(new Event('change'));
    f.media.matches = false; f.media.dispatchEvent(new Event('change')); f.page.dispatchEvent(new Event('pageshow'));
    assert.equal(f.calls(), 1); assert.equal(f.video.hidden, true); assert.equal(f.button.hidden, true);
});

test('back navigation pauses the frame and never starts a second automatic playback', async () => {
    const f = fixture(); await settle(); f.video.currentTime = 7;
    f.page.dispatchEvent(new Event('pagehide')); f.page.dispatchEvent(new Event('pageshow'));
    assert.equal(f.video.paused, true); assert.equal(f.video.currentTime, 7); assert.equal(f.calls(), 1);
});

test('scroll is bounded, proportional and strictly static for reduced motion', () => {
    assert.deepEqual(motion_values(-10), motion_values(0)); assert.deepEqual(motion_values(10), motion_values(1));
    assert.ok(motion_values(1).scale > motion_values(0).scale);
    assert.ok(motion_values(1, true).scale - motion_values(0, true).scale < .03);
    for (const progress of [NaN, -100, 0, .5, 1, 100]) assert.deepEqual(motion_values(progress, false, true), { scale: 1, shift: 0, light: .1, emphasis: 1 });
});

test('scroll events coalesce into one frame, and reduced motion never starts an animation loop', () => {
    const viewport = new EventTarget(), reduced = new EventTarget(), styles = new Map(), frames = [];
    Object.assign(viewport, { innerWidth: 1440, innerHeight: 900, requestAnimationFrame: fn => { frames.push(fn); return frames.length; } });
    const section = { getBoundingClientRect: () => ({ top: -100, height: 1400 }), style: { setProperty: (k, v) => styles.set(k, v) } };
    setup_scroll(section, viewport, reduced);
    for (let i = 0; i < 20; i++) viewport.dispatchEvent(new Event('scroll'));
    assert.equal(frames.length, 1); frames[0](); assert.ok(styles.has('--cinema-scale'));
    reduced.matches = true; reduced.dispatchEvent(new Event('change')); viewport.dispatchEvent(new Event('scroll'));
    assert.equal(frames.length, 1); assert.equal(styles.get('--cinema-scale'), '1.0000');
});

test('a delayed first decoded frame keeps the real poster visible instead of a black gap', async () => {
    const f = fixture({ delayedFrame: true }); await settle();
    assert.equal(f.fallback.hidden, false); assert.equal(f.video.style.opacity, '0');
    f.frames[0]();
    assert.equal(f.fallback.hidden, true); assert.equal(f.video.style.opacity, '1');
    assert.equal(f.assignments(), 1);
});

test('reading progresses in word order, reverses with scrolling and restores deterministically', () => {
    const { word_levels } = require('../public/js/cinema-scroll');
    assert.deepEqual(word_levels(0, 4), [0, 0, 0, 0]);
    assert.deepEqual(word_levels(.375, 4), [1, .5, 0, 0]);
    assert.deepEqual(word_levels(1, 4), [1, 1, 1, 1]);
    assert.deepEqual(word_levels(.125, 4), [.5, 0, 0, 0]);
    assert.deepEqual(word_levels(.375, 4), word_levels(.375, 4));
    for (const progress of [-1, NaN, .5, 2]) assert.deepEqual(word_levels(progress, 4, true), [1, 1, 1, 1]);
    assert.deepEqual(word_levels(.5, 0), []);
});

test('offscreen scenes do not schedule frames and reentry updates the current position', () => {
    const viewport = new EventTarget(), reduced = new EventTarget(), frames = [], styles = new Map();
    let notify, top = 0;
    Object.assign(viewport, { innerWidth: 1440, innerHeight: 900, requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
        IntersectionObserver: class { constructor(fn) { notify = fn; } observe() {} } });
    const section = { getBoundingClientRect: () => ({ top, height: 1400 }), style: { setProperty: (k, v) => styles.set(k, v) } };
    setup_scroll(section, viewport, reduced); notify([{ isIntersecting: false }]);
    viewport.dispatchEvent(new Event('scroll')); assert.equal(frames.length, 0);
    top = -350; notify([{ isIntersecting: true }]); assert.equal(frames.length, 1); frames[0]();
    assert.equal(styles.get('--cinema-scale'), motion_values(.7).scale.toFixed(4));
});
