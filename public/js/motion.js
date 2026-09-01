(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const precise_pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const can_move = () => !reduced.matches && precise_pointer.matches;
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    function setup_reveals(root = document) {
        const elements = root.querySelectorAll('.section-heading,.about-preview>*,.page-intro>*,.checkout-layout>*,.review-compose>*,.product-card,.review-card,.detail-layout>*,.scent-trail-header,.scent-step');
        if (reduced.matches || !('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('is-revealed'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
        elements.forEach((element, index) => {
            if (element.dataset.motionReady) return;
            element.dataset.motionReady = 'true';
            element.classList.add('motion-reveal');
            if (element.matches('.section-heading,.page-intro,.scent-trail-header')) element.classList.add('motion-heading');
            element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 45}ms`);
            observer.observe(element);
        });
    }

    function setup_entry_sequence() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const parts = hero.querySelectorAll('.eyebrow,h1,.hero-copy>p:not(.eyebrow),.button,.hero-image');
        parts.forEach((part, index) => {
            part.classList.add('hero-entry');
            part.style.setProperty('--entry-delay', `${120 + index * 85}ms`);
        });
        requestAnimationFrame(() => document.documentElement.classList.add('motion-entered'));
    }

    function setup_scroll_depth() {
        if (reduced.matches) return;
        const hero = document.querySelector('.hero');
        const editorial = [...document.querySelectorAll('.detail-layout')];
        if (!hero && !editorial.length) return;
        let frame = 0;
        const render = () => {
            frame = 0;
            if (hero) {
                const box = hero.getBoundingClientRect();
                const progress = clamp(-box.top / Math.max(box.height, 1), 0, 1);
                hero.style.setProperty('--hero-scroll', progress.toFixed(4));
                hero.style.setProperty('--hero-shift', `${(-progress * 34).toFixed(2)}px`);
                hero.style.setProperty('--hero-copy-shift', `${(-progress * 16).toFixed(2)}px`);
                hero.style.setProperty('--hero-scale', (1.035 - progress * 0.025).toFixed(4));
            }
            editorial.forEach(section => {
                const box = section.getBoundingClientRect();
                const progress = clamp((window.innerHeight - box.top) / (window.innerHeight + box.height), 0, 1);
                section.style.setProperty('--section-progress', progress.toFixed(4));
                section.style.setProperty('--section-shift', `${((0.5 - progress) * 44).toFixed(2)}px`);
                section.style.setProperty('--section-scale', (1.055 - progress * 0.035).toFixed(4));
            });
        };
        const queue = () => {
            if (frame) return;
            frame = requestAnimationFrame(render);
        };
        render();
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue, { passive: true });
    }

    function setup_hero_depth() {
        const hero = document.querySelector('.hero');
        if (!hero || !can_move()) return;
        let frame = 0;
        hero.addEventListener('pointermove', event => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                const box = hero.getBoundingClientRect();
                const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
                const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
                hero.style.setProperty('--depth-x', x.toFixed(3));
                hero.style.setProperty('--depth-y', y.toFixed(3));
                hero.style.setProperty('--hero-light-x', `${(58 + x * 8).toFixed(2)}%`);
                hero.style.setProperty('--hero-light-y', `${(42 + y * 7).toFixed(2)}%`);
                frame = 0;
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            hero.style.setProperty('--depth-x', '0');
            hero.style.setProperty('--depth-y', '0');
            hero.style.setProperty('--hero-light-x', '58%');
            hero.style.setProperty('--hero-light-y', '42%');
        }, { passive: true });
    }

    function setup_magnetic_buttons() {
        if (!can_move()) return;
        document.querySelectorAll('.hero .button').forEach(button => {
            let frame = 0;
            button.classList.add('button-magnetic');
            button.addEventListener('pointermove', event => {
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    const box = button.getBoundingClientRect();
                    const x = Math.max(-5, Math.min(5, (event.clientX - box.left - box.width / 2) * 0.08));
                    const y = Math.max(-4, Math.min(4, (event.clientY - box.top - box.height / 2) * 0.08));
                    button.style.setProperty('--magnetic-x', `${x}px`);
                    button.style.setProperty('--magnetic-y', `${y}px`);
                    frame = 0;
                });
            });
            button.addEventListener('pointerleave', () => {
                button.style.setProperty('--magnetic-x', '0px');
                button.style.setProperty('--magnetic-y', '0px');
            });
        });
    }

    function setup_dynamic_content() {
        if (!('MutationObserver' in window)) return;
        const observer = new MutationObserver(records => {
            if (records.some(record => record.addedNodes.length)) setup_reveals(document);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function initialize_motion() {
        document.documentElement.classList.add('motion-ready');
        setup_entry_sequence();
        setup_reveals();
        setup_hero_depth();
        setup_scroll_depth();
        setup_magnetic_buttons();
        setup_dynamic_content();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize_motion, { once: true });
    else initialize_motion();
})();
