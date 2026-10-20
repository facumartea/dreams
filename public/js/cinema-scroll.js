'use strict';
{
    function motion_values(progress, mobile = false, reduced = false) {
        if (reduced) return { scale: 1, shift: 0, light: .1, emphasis: 1 };
        const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
        return { scale: mobile ? .99 + p * .02 : .96 + p * .075,
            shift: (0.5 - p) * (mobile ? 8 : 32), light: .08 + p * .12, emphasis: .6 + p * .4 };
    }

    function paint(section, viewport, reduced) {
        const box = section.getBoundingClientRect();
        const mobile = viewport.innerWidth <= 920;
        const progress = mobile ? (viewport.innerHeight - box.top) / (viewport.innerHeight + box.height)
            : -box.top / Math.max(1, box.height - viewport.innerHeight);
        const value = motion_values(progress, mobile, reduced.matches);
        for (const [key, number] of Object.entries(value)) {
            section.style.setProperty(`--cinema-${key}`, number.toFixed(4) + (key === 'shift' ? 'px' : ''));
        }
    }

    function setup_scroll(section, viewport, reduced) {
        let frame = 0, active = true;
        const queue = () => {
            if (frame || !active || reduced.matches) return;
            frame = viewport.requestAnimationFrame(() => { frame = 0; paint(section, viewport, reduced); });
        };
        if ('IntersectionObserver' in viewport) {
            const observer = new viewport.IntersectionObserver(entries => { active = entries[0].isIntersecting; queue(); }, { rootMargin: '160px' });
            observer.observe(section);
        }
        viewport.addEventListener('scroll', queue, { passive: true });
        viewport.addEventListener('resize', queue, { passive: true });
        viewport.addEventListener('pageshow', queue);
        reduced.addEventListener?.('change', () => paint(section, viewport, reduced));
        paint(section, viewport, reduced);
    }

    function install() {
        const section = document.querySelector('.cinema-story');
        if (section) setup_scroll(section, window, matchMedia('(prefers-reduced-motion: reduce)'));
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = { motion_values, setup_scroll };
    if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', install, { once: true });
}
