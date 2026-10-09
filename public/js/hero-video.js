(() => {
    const KEY = 'dreams_hero_video_started_v3';
    function create_controller({ video, button, fallback, storage, reduced, connection, navigation_type, page }) {
        let started = false, ended = false, failed = false, busy = false;
        const limited = () => reduced.matches || connection?.saveData === true;
        const remembered = () => { try { return storage.getItem(KEY) === 'true'; } catch { return false; } };
        const remember = () => { try { storage.setItem(KEY, 'true'); } catch { /* Optional session memory. */ } };
        const static_frame = final => {
            button.hidden = true; video.pause(); video.hidden = true; fallback.hidden = false;
            fallback.src = final ? '/assets/dreams-hero-video-final.webp' : '/assets/dreams-hero-video-poster.webp';
        };
        if (navigation_type === 'reload') { try { storage.removeItem(KEY); } catch { /* Optional session memory. */ } }
        const sync_button = () => {
            button.dataset.paused = String(video.paused);
            button.setAttribute('aria-label', video.paused ? 'Continuar video' : 'Pausar video');
            button.setAttribute('aria-pressed', String(video.paused));
        };
        video.addEventListener('pause', sync_button);
        video.addEventListener('playing', () => {
            if (limited() || failed || ended) { static_frame(started || ended); return; }
            started = true; remember(); video.hidden = false; fallback.hidden = true; button.hidden = false; sync_button();
        });
        video.addEventListener('ended', () => {
            ended = true; remember(); button.hidden = true;
            // Preserve the actual last frame without seeking, reloading or removing src.
        });
        video.addEventListener('error', () => { failed = true; static_frame(false); });
        const preferences = () => { if (limited()) { failed = true; static_frame(started || ended); } };
        reduced.addEventListener?.('change', preferences);
        connection?.addEventListener?.('change', preferences);
        page.addEventListener('pagehide', () => video.pause());
        // BFCache returns retain their frame/time without automatically resuming.
        if (limited() || remembered()) { static_frame(remembered()); return; }
        video.muted = true; video.loop = false; video.playsInline = true; video.controls = false;
        video.src = '/assets/dreams-hero-video.mp4';
        async function play() {
            if (busy || ended || failed || limited()) return;
            busy = true;
            try { await video.play(); }
            catch { failed = true; static_frame(started || ended); }
            finally { busy = false; }
        }
        button.addEventListener('click', () => {
            if (busy || ended || failed || limited()) return;
            if (video.paused) void play(); else video.pause();
        });
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
        video.controls = false; video.disablePictureInPicture = true;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'hero-video-control';
        button.hidden = true; button.setAttribute('aria-label', 'Pausar video');
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
