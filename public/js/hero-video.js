(() => {
    const KEY = 'dreams_hero_video_started_v1';
    function create_controller({ video, button, fallback, storage, reduced, connection, navigation_type, page }) {
        let started = false, ended = false, failed = false, busy = false;
        const limited = () => reduced.matches || connection?.saveData === true;
        const remembered = () => { try { return storage.getItem(KEY) === 'true'; } catch { return false; } };
        const remember = () => { try { storage.setItem(KEY, 'true'); } catch { /* Playback still works if storage is unavailable. */ } };
        const static_frame = final => {
            video.pause(); video.hidden = true; fallback.hidden = false;
            fallback.src = final ? '/assets/dreams-hero-video-final.webp' : '/assets/dreams-hero-video-poster.webp';
            button.hidden = true;
        };
        if (navigation_type === 'reload') { try { storage.removeItem(KEY); } catch { /* Optional session memory. */ } }
        const play = async () => {
            if (busy || ended || failed || limited()) return;
            busy = true;
            try { await video.play(); }
            catch {
                if (limited() || failed || ended) { static_frame(started || ended); return; }
                video.hidden = true; fallback.hidden = false; button.hidden = false;
                button.textContent = started ? 'Continuar video' : 'Reproducir video';
            } finally { busy = false; }
        };
        video.addEventListener('playing', () => {
            if (limited() || failed) { static_frame(started); return; }
            started = true; remember(); video.hidden = false; fallback.hidden = true;
            button.hidden = false; button.textContent = 'Pausar video';
        });
        video.addEventListener('pause', () => { if (!ended) button.textContent = 'Continuar video'; });
        video.addEventListener('ended', () => {
            ended = true; remember(); button.hidden = true;
            // Do not seek, reload or remove the source: preserve the actual last frame.
        });
        video.addEventListener('error', () => { failed = true; static_frame(false); });
        button.addEventListener('click', () => {
            if (busy || ended || failed || limited()) return;
            if (video.paused) void play(); else video.pause();
        });
        const preferences = () => {
            if (limited()) static_frame(started || ended);
            else if (video.src && !ended && !failed) { button.hidden = false; button.textContent = 'Continuar video'; }
        };
        reduced.addEventListener?.('change', preferences);
        connection?.addEventListener?.('change', preferences);
        page.addEventListener('pagehide', () => video.pause());
        // BFCache returns keep the frame/time and never resume automatically.
        if (limited() || remembered()) { static_frame(remembered()); return; }
        video.src = '/assets/dreams-hero-video.mp4';
        video.muted = true; video.loop = false; video.playsInline = true;
        void play();
    }

    async function install() {
        const hero = document.querySelector('.hero-static');
        if (!hero || hero.dataset.videoInstalled) return;
        let config;
        try {
            const response = await fetch('/api/config');
            if (!response.ok) return;
            config = await response.json();
        } catch { return; }
        if (config.hero_video !== true || hero.dataset.videoInstalled) return;
        hero.dataset.videoInstalled = 'true'; hero.classList.add('hero-video');
        const stage = hero.querySelector('.hero-product-stage');
        stage.classList.add('hero-video-stage');
        const fallback = document.createElement('img');
        fallback.src = '/assets/dreams-hero-video-poster.webp';
        fallback.alt = 'Frasco DREAMS iluminado sobre una base de piedra';
        fallback.width = 1280; fallback.height = 720;
        const video = document.createElement('video');
        video.hidden = true; video.preload = 'none';
        video.setAttribute('aria-label', 'Presentación del perfume DREAMS');
        video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'hero-video-toggle';
        button.textContent = 'Reproducir video'; button.hidden = true;
        stage.replaceChildren(fallback, video, button);
        let storage;
        try { storage = window.sessionStorage; } catch { storage = null; }
        create_controller({ video, button, fallback, storage,
            reduced: matchMedia('(prefers-reduced-motion: reduce)'), connection: navigator.connection,
            navigation_type: performance.getEntriesByType('navigation')[0]?.type, page: window });
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { create_controller };
    if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', install, { once: true });
})();
