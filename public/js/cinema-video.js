'use strict';
{
    const KEY = 'dreams_hero_video_started_v3';
    const poster = '/assets/dreams-hero-video-poster.webp';
    const final_frame = '/assets/dreams-hero-video-final.webp';

    function storage_read(storage) {
        try { return storage?.getItem(KEY) === 'true'; } catch { return false; }
    }

    function remember(state) {
        try { state.storage?.setItem(KEY, 'true'); } catch { /* El video funciona sin almacenamiento. */ }
    }

    function limited(state) {
        return state.reduced.matches || state.connection?.saveData === true;
    }

    function static_frame(state, final = false) {
        state.video.pause();
        state.video.hidden = true;
        state.button.hidden = true;
        state.fallback.hidden = false;
        state.fallback.src = final ? final_frame : poster;
    }

    function sync_button(state) {
        state.button.dataset.paused = String(state.video.paused);
        state.button.setAttribute('aria-label', state.video.paused ? 'Continuar video' : 'Pausar video');
        state.button.setAttribute('aria-pressed', String(state.video.paused));
    }

    async function play(state) {
        if (state.busy || state.ended || state.failed || state.sleeping || limited(state)) return;
        state.busy = true;
        try { await state.video.play(); }
        catch { state.failed = true; static_frame(state, state.started); }
        finally { state.busy = false; }
    }

    function reveal_video(state) {
        const show = () => {
            if (limited(state) || state.failed || state.sleeping) return;
            state.presented = true;
            if (state.video.style) state.video.style.opacity = '1';
            state.fallback.hidden = true;
            state.button.hidden = state.ended;
            sync_button(state);
        };
        state.video.hidden = false;
        if (!state.presented && state.video.requestVideoFrameCallback) {
            state.video.style.opacity = '0';
            state.video.requestVideoFrameCallback(show);
        } else show();
    }

    function playing(state) {
        if (limited(state) || state.failed || state.ended || state.sleeping) return static_frame(state, state.started);
        state.started = true;
        remember(state);
        // El póster sigue visible hasta que exista un fotograma presentado.
        reveal_video(state);
    }

    function preferences(state) {
        if (!limited(state)) return;
        state.failed = true;
        static_frame(state, state.started);
    }

    function connect_events(state) {
        const { video, button, page } = state;
        video.addEventListener('pause', () => sync_button(state));
        video.addEventListener('playing', () => playing(state));
        video.addEventListener('ended', () => { state.ended = true; remember(state); button.hidden = true; });
        video.addEventListener('error', () => { state.failed = true; static_frame(state); });
        state.reduced.addEventListener?.('change', () => preferences(state));
        state.connection?.addEventListener?.('change', () => preferences(state));
        page.addEventListener('pagehide', () => { state.sleeping = true; video.pause(); });
        page.addEventListener('pageshow', () => { state.sleeping = false; });
        button.addEventListener('click', () => {
            if (state.busy || state.ended || state.failed || limited(state)) return;
            if (video.paused) void play(state); else video.pause();
        });
    }

    function create_player(options) {
        const state = { ...options, busy: false, ended: false, started: false, failed: false, sleeping: false };
        connect_events(state);
        if (options.navigation_type === 'reload') {
            try { state.storage?.removeItem(KEY); } catch { /* La memoria de sesión es opcional. */ }
        }
        const remembered = storage_read(state.storage);
        if (limited(state) || remembered) { static_frame(state, remembered); return state; }
        Object.assign(state.video, { muted: true, loop: false, playsInline: true, controls: false });
        // Se asigna una sola URL: scroll, hover y finalización nunca recargan el recurso.
        state.video.src = '/assets/dreams-hero-video.mp4';
        void play(state);
        return state;
    }

    async function install() {
        const hero = document.querySelector('.cinema-hero');
        if (!hero || hero.dataset.videoInstalled) return;
        try {
            const response = await fetch('/api/config');
            if (!response.ok || (await response.json()).hero_video !== true || hero.dataset.videoInstalled) return;
        } catch { return; }
        hero.dataset.videoInstalled = 'true';
        let storage;
        try { storage = sessionStorage; } catch { /* Respaldo estático si el navegador limita recursos. */ }
        create_player({ video: hero.querySelector('[data-cinema-video]'), button: hero.querySelector('[data-cinema-pause]'),
            fallback: hero.querySelector('[data-cinema-fallback]'), storage,
            reduced: matchMedia('(prefers-reduced-motion: reduce)'), connection: navigator.connection,
            navigation_type: performance.getEntriesByType('navigation')[0]?.type, page: window });
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = { create_player };
    if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', install, { once: true });
}
