(() => {
    const reduced_motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine_pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const can_track = () => fine_pointer.matches && !reduced_motion.matches;

    document.documentElement.classList.add('motion-lab-ready');

    function setup_reveals() {
        const elements = document.querySelectorAll('[data-reveal],.motion-heading--reveal');
        if (reduced_motion.matches || !('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('is-revealed'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
        elements.forEach((element, index) => {
            element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
            observer.observe(element);
        });
    }

    function setup_scroll_depth() {
        const layers = [...document.querySelectorAll('[data-parallax]')];
        if (!layers.length || reduced_motion.matches) return;
        let frame = 0;
        const render = () => {
            frame = 0;
            const viewport = window.innerHeight;
            layers.forEach(layer => {
                const rect = layer.getBoundingClientRect();
                if (rect.bottom < -viewport * .2 || rect.top > viewport * 1.2) return;
                const strength = Number(layer.dataset.parallax || 0);
                const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1) - .5;
                const base = layer.classList.contains('scent-story__bottle') ? 'translate(-50%,-50%) ' : '';
                layer.style.transform = `${base}translate3d(0,${(progress * strength * 110).toFixed(2)}px,0)`;
            });
        };
        const request_render = () => {
            if (!frame) frame = requestAnimationFrame(render);
        };
        addEventListener('scroll', request_render, { passive: true });
        addEventListener('resize', request_render, { passive: true });
        render();
    }

    function setup_tilt() {
        if (!can_track()) return;
        document.querySelectorAll('[data-tilt]').forEach(card => {
            let frame = 0;
            let pointer_x = 0;
            let pointer_y = 0;
            const render = () => {
                frame = 0;
                const rect = card.getBoundingClientRect();
                const x = clamp((pointer_x - rect.left) / rect.width, 0, 1);
                const y = clamp((pointer_y - rect.top) / rect.height, 0, 1);
                card.style.setProperty('--ry', `${((x - .5) * 3.2).toFixed(2)}deg`);
                card.style.setProperty('--rx', `${((.5 - y) * 2.6).toFixed(2)}deg`);
                card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
                card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
            };
            card.addEventListener('pointermove', event => {
                pointer_x = event.clientX;
                pointer_y = event.clientY;
                if (!frame) frame = requestAnimationFrame(render);
            });
            card.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
                card.style.setProperty('--mx', '50%');
                card.style.setProperty('--my', '50%');
            });
        });
    }

    function setup_magnetic_buttons() {
        if (!can_track()) return;
        document.querySelectorAll('[data-magnetic]').forEach(button => {
            let frame = 0;
            let dx = 0;
            let dy = 0;
            const render = () => {
                frame = 0;
                button.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`;
            };
            button.addEventListener('pointermove', event => {
                const rect = button.getBoundingClientRect();
                dx = clamp((event.clientX - rect.left - rect.width / 2) * .08, -7, 7);
                dy = clamp((event.clientY - rect.top - rect.height / 2) * .12, -5, 5);
                if (!frame) frame = requestAnimationFrame(render);
            });
            button.addEventListener('pointerleave', () => {
                dx = 0;
                dy = 0;
                if (!frame) frame = requestAnimationFrame(render);
            });
        });
    }

    function setup_studio_light() {
        const section = document.querySelector('[data-studio-light]');
        if (!section || !can_track()) return;
        let frame = 0;
        let x = 50;
        let y = 45;
        section.addEventListener('pointermove', event => {
            const rect = section.getBoundingClientRect();
            x = clamp(((event.clientX - rect.left) / rect.width) * 100, 12, 88);
            y = clamp(((event.clientY - rect.top) / rect.height) * 100, 15, 85);
            if (!frame) frame = requestAnimationFrame(() => {
                frame = 0;
                section.style.setProperty('--light-x', `${x.toFixed(1)}%`);
                section.style.setProperty('--light-y', `${y.toFixed(1)}%`);
            });
        });
    }

    function setup_context_cursor() {
        const cursor = document.querySelector('.motion-cursor');
        if (!cursor || !can_track()) return;
        let frame = 0;
        let x = 0;
        let y = 0;
        const render = () => {
            frame = 0;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        };
        document.querySelectorAll('[data-cursor-zone]').forEach(zone => {
            zone.addEventListener('pointerenter', () => {
                cursor.querySelector('span').textContent = zone.dataset.cursorLabel || 'VIEW';
                cursor.classList.add('is-visible');
            });
            zone.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
            zone.addEventListener('pointermove', event => {
                x = event.clientX;
                y = event.clientY;
                if (!frame) frame = requestAnimationFrame(render);
            });
        });
    }

    function setup_scent_story() {
        const visual = document.querySelector('.scent-story__visual');
        const steps = [...document.querySelectorAll('[data-scent-step]')];
        if (!visual || !steps.length) return;
        const activate = step => {
            steps.forEach(candidate => candidate.classList.toggle('is-active', candidate === step));
            visual.dataset.stage = step.dataset.scentStep;
        };
        if (!('IntersectionObserver' in window)) {
            activate(steps[0]);
            return;
        }
        const observer = new IntersectionObserver(entries => {
            const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) activate(visible.target);
        }, { threshold: [.35, .55, .72], rootMargin: '-20% 0px -35% 0px' });
        steps.forEach(step => observer.observe(step));
        activate(steps[0]);
    }

    function initialize() {
        setup_reveals();
        setup_scroll_depth();
        setup_tilt();
        setup_magnetic_buttons();
        setup_studio_light();
        setup_context_cursor();
        setup_scent_story();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
    else initialize();
})();
