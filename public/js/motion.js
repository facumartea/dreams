(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const precise_pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const can_move = () => !reduced.matches && precise_pointer.matches;

    function setup_reveals(root = document) {
        const elements = root.querySelectorAll('.section-heading,.brand-statement,.split-banner>div,.split-banner>img,.about-preview>*,.page-intro>*,.checkout-layout>*,.review-compose>*,.product-card,.review-card');
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
            element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 45}ms`);
            observer.observe(element);
        });
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
                frame = 0;
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            hero.style.setProperty('--depth-x', '0');
            hero.style.setProperty('--depth-y', '0');
        }, { passive: true });
    }

    function setup_spotlight() {
        document.querySelectorAll('.split-banner').forEach(element => {
            if (!can_move()) return;
            let frame = 0;
            element.classList.add('motion-spotlight');
            element.addEventListener('pointermove', event => {
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    const box = element.getBoundingClientRect();
                    element.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
                    element.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
                    frame = 0;
                });
            }, { passive: true });
        });
    }

    function setup_magnetic_buttons() {
        if (!can_move()) return;
        document.querySelectorAll('.hero .button,.split-banner .button').forEach(button => {
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
        setup_reveals();
        setup_hero_depth();
        setup_spotlight();
        setup_magnetic_buttons();
        setup_dynamic_content();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize_motion, { once: true });
    else initialize_motion();
})();
