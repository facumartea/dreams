// Carrusel manual de productos reales: sin autoplay ni sustitución de la portada.
{
    const reduced_motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const list = document.getElementById('featured-products');
    const previous = document.getElementById('featured-previous');
    const next = document.getElementById('featured-next');
    const status = document.getElementById('featured-status');

    function carousel_state() {
        if (!list) return;
        const cards = [...list.querySelectorAll('.product-card')];
        const maximum = list.scrollWidth - list.clientWidth;
        previous.disabled = list.scrollLeft <= 2;
        next.disabled = list.scrollLeft >= maximum - 2 || !cards.length;
        const left = list.getBoundingClientRect().left;
        const index = cards.findIndex(card => card.getBoundingClientRect().right > left + 2);
        status.textContent = cards.length ? `Producto ${index + 1} de ${cards.length}` : '';
    }

    function move_carousel(direction) {
        const width = list.querySelector('.product-card')?.getBoundingClientRect().width || list.clientWidth;
        list.scrollBy({ left: direction * (width + 24), behavior: reduced_motion.matches ? 'instant' : 'smooth' });
    }

    function initialize_carousel() {
        if (!list || !previous || !next || !status) return;
        previous.addEventListener('click', () => move_carousel(-1));
        next.addEventListener('click', () => move_carousel(1));
        list.addEventListener('scroll', carousel_state, { passive: true });
        window.addEventListener('resize', carousel_state, { passive: true });
        new MutationObserver(carousel_state).observe(list, { childList: true });
        carousel_state();
    }
    initialize_carousel();
}
