// agrega movimiento a elementos presentes y respeta la preferencia de movimiento reducido.
// factories separadas conservan el ambito privado de la inicializacion.
function preparar_apariciones_de_secciones(reduced) {
    return function setup_reveals(root = document) {
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
    };
}

function preparar_movimiento_al_desplazarse(reduced, clamp) {
    return function setup_scroll_depth() {
        if (reduced.matches) return;
        const editorial = [...document.querySelectorAll('.detail-layout')];
        if (!editorial.length) return;
        let frame = 0;
        const mostrar_contenido = () => {
            frame = 0;
            editorial.forEach(section => {
                const box = section.getBoundingClientRect();
                const progress = clamp((window.innerHeight - box.top) / (window.innerHeight + box.height), 0, 1);
                section.style.setProperty('--section-progress', progress.toFixed(4));
                section.style.setProperty('--section-shift', `${((0.5 - progress) * 44).toFixed(2)}px`);
                section.style.setProperty('--section-scale', (1.055 - progress * 0.035).toFixed(4));
            });
        };
        const cola = () => {
            if (frame) return;
            frame = requestAnimationFrame(mostrar_contenido);
        };
        mostrar_contenido();
        window.addEventListener('scroll', cola, { passive: true });
        window.addEventListener('resize', cola, { passive: true });
    };
}

(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const limitar_valor = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

    const setup_reveals = preparar_apariciones_de_secciones(reduced);
    const setup_scroll_depth = preparar_movimiento_al_desplazarse(reduced, limitar_valor);

    function preparar_contenido_dinamico() {
        if (!('MutationObserver' in window)) return;
        const observer = new MutationObserver(records => {
            if (records.some(record => record.addedNodes.length)) setup_reveals(document);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function preparar_movimiento() {
        document.documentElement.classList.add('motion-ready');
        setup_reveals();
        setup_scroll_depth();
        preparar_contenido_dinamico();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preparar_movimiento, { once: true });
    else preparar_movimiento();
})();
