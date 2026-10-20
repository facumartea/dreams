'use strict';
{
    function motion_values(progress, mobile = false, reduced = false) {
        if (reduced) return { scale: 1, shift: 0, light: .1, emphasis: 1 };
        const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
        return { scale: mobile ? .99 + p * .02 : .96 + p * .075,
            shift: (0.5 - p) * (mobile ? 8 : 32), light: .08 + p * .12, emphasis: .6 + p * .4 };
    }

    function word_levels(progress, count, reduced = false) {
        const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
        return Array.from({ length: count }, (_, index) => reduced ? 1 : Math.max(0, Math.min(1, p * count - index)));
    }

    function prepare_words(heading) {
        if (!heading) return [];
        const document = heading.ownerDocument;
        const parts = heading.textContent.trim().split(/(\s+)/);
        heading.replaceChildren(...parts.map(text => {
            if (/^\s+$/.test(text)) return document.createTextNode(text);
            const word = document.createElement('span');
            word.className = 'cinema-word'; word.textContent = text;
            return word;
        }));
        return Array.from(heading.querySelectorAll('.cinema-word'));
    }

    function paint_words(words, progress, reduced) {
        const levels = word_levels(progress, words.length, reduced);
        words.forEach((word, index) => {
            const value = levels[index].toFixed(3);
            if (word.style.getPropertyValue('--word-light') !== value) word.style.setProperty('--word-light', value);
        });
    }

    function paint(section, viewport, reduced, words) {
        const box = section.getBoundingClientRect();
        const mobile = viewport.innerWidth <= 920;
        const progress = mobile ? (viewport.innerHeight - box.top) / (viewport.innerHeight + box.height)
            : -box.top / Math.max(1, box.height - viewport.innerHeight);
        const value = motion_values(progress, mobile, reduced.matches);
        const heading = section.querySelector?.('h2');
        const reading = mobile && heading ? (viewport.innerHeight * .83 - heading.getBoundingClientRect().top)
            / Math.max(1, viewport.innerHeight * .5) : (66 - box.top) / Math.max(1, box.height - viewport.innerHeight);
        paint_words(words, reading, reduced.matches);
        for (const [key, number] of Object.entries(value)) {
            section.style.setProperty(`--cinema-${key}`, number.toFixed(4) + (key === 'shift' ? 'px' : ''));
        }
    }

    function setup_scroll(section, viewport, reduced) {
        const words = prepare_words(section.querySelector?.('h2'));
        let frame = 0, active = true;
        const queue = () => {
            if (frame || !active || reduced.matches) return;
            frame = viewport.requestAnimationFrame(() => { frame = 0; paint(section, viewport, reduced, words); });
        };
        if ('IntersectionObserver' in viewport) {
            const observer = new viewport.IntersectionObserver(entries => { active = entries[0].isIntersecting; queue(); }, { rootMargin: '160px' });
            observer.observe(section);
        }
        if ('ResizeObserver' in viewport) {
            const resize = new viewport.ResizeObserver(queue); resize.observe(section); if (words[0]) resize.observe(words[0].parentElement);
        }
        viewport.addEventListener('scroll', queue, { passive: true });
        viewport.addEventListener('resize', queue, { passive: true });
        viewport.addEventListener('pageshow', queue);
        reduced.addEventListener?.('change', () => paint(section, viewport, reduced, words));
        paint(section, viewport, reduced, words);
    }

    function install() {
        const section = document.querySelector('.cinema-story');
        if (section) setup_scroll(section, window, matchMedia('(prefers-reduced-motion: reduce)'));
    }

    if (typeof module !== 'undefined' && module.exports) module.exports = { motion_values, word_levels, prepare_words, setup_scroll };
    if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', install, { once: true });
}
