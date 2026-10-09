const test = require('node:test');
const assert = require('node:assert/strict');
const { create_controller } = require('../public/js/hero-video');

function fixture({ blocked = false, reduced = false, saveData = false, remembered = false, brokenStorage = false, reload = false } = {}) {
    const video = new EventTarget(), media = new EventTarget(), connection = new EventTarget(), page = new EventTarget();
    const values = new Map(remembered ? [['dreams_hero_video_started_v2', 'true']] : []);
    let calls = 0;
    video.paused = true; video.hidden = true; video.src = ''; video.currentTime = 0; video.duration = 5;
    video.play = async () => { calls++; if (blocked) throw new Error('Autoplay blocked'); video.paused = false; video.dispatchEvent(new Event('playing')); };
    video.pause = () => { video.paused = true; video.dispatchEvent(new Event('pause')); };
    media.matches = reduced; connection.saveData = saveData;
    const storage = { getItem: key => { if (brokenStorage) throw new Error('Storage unavailable'); return values.get(key); }, setItem: (key, v) => values.set(key, v), removeItem: key => values.delete(key) };
    const fallback = { hidden: false, src: '/assets/dreams-hero-video-poster.webp' };
    create_controller({ video, fallback, storage, reduced: media, connection, navigation_type: reload ? 'reload' : 'navigate', page });
    return { video, fallback, media, page, values, calls: () => calls, allow: () => { blocked = false; } };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('video respects reduced motion and save-data without assigning a media source or starting playback', () => {
    for (const options of [{ reduced: true }, { saveData: true }]) {
        const f = fixture(options);
        assert.equal(f.calls(), 0); assert.equal(f.video.src, ''); assert.equal(f.video.hidden, true); assert.equal(f.fallback.hidden, false);
    }
});
test('blocked autoplay keeps a static poster without controls or automatic retries', async () => {
    const f = fixture({ blocked: true }); await settle();
    assert.equal(f.video.hidden, true); assert.equal(f.fallback.hidden, false); assert.equal(f.video.controls, false); assert.equal(f.values.size, 0);
    f.allow(); f.page.dispatchEvent(new Event('pageshow')); f.media.dispatchEvent(new Event('change')); await settle();
    assert.equal(f.calls(), 1); assert.equal(f.video.hidden, true);
});
test('ending keeps the last frame and returning in the same session does not replay; explicit reload can start again', async () => {
    const f = fixture(); await settle(); f.video.currentTime = 5; f.video.dispatchEvent(new Event('ended'));
    f.page.dispatchEvent(new Event('pageshow')); assert.equal(f.calls(), 1); assert.equal(f.video.currentTime, 5); assert.equal(f.video.hidden, false);
    const returning = fixture({ remembered: true }); assert.equal(returning.calls(), 0); assert.match(returning.fallback.src, /final.webp$/);
    const reloaded = fixture({ remembered: true, reload: true }); await settle(); assert.equal(reloaded.calls(), 1);
});
test('pagehide pauses without resuming on pageshow, and preference changes stop automatic motion', async () => {
    const f = fixture(); await settle(); f.video.currentTime = 2; f.page.dispatchEvent(new Event('pagehide')); f.page.dispatchEvent(new Event('pageshow'));
    assert.equal(f.video.paused, true); assert.equal(f.calls(), 1); assert.equal(f.video.currentTime, 2);
    f.media.matches = true; f.media.dispatchEvent(new Event('change')); assert.equal(f.video.hidden, true);
    f.media.matches = false; f.media.dispatchEvent(new Event('change')); assert.equal(f.calls(), 1);
});
test('media errors restore the poster, and unavailable storage does not prevent playback', async () => {
    const f = fixture({ brokenStorage: true }); await settle(); assert.equal(f.calls(), 1);
    f.video.dispatchEvent(new Event('error')); assert.equal(f.video.hidden, true); assert.equal(f.fallback.hidden, false);
});

test('a replacement asset longer than five seconds is stopped and replaced by the poster', async () => {
    const f = fixture(); await settle();
    f.video.duration = 20; f.video.dispatchEvent(new Event('loadedmetadata'));
    assert.equal(f.video.paused, true); assert.equal(f.video.hidden, true); assert.equal(f.fallback.hidden, false);
    f.video.dispatchEvent(new Event('playing')); assert.equal(f.video.hidden, true); assert.equal(f.calls(), 1);
});
