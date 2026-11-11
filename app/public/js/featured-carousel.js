// mueve los destacados con controles, teclado y tacto; sin reproduccion automatica.
// desplazamiento manual: conserva enlaces y botones de las tarjetas, sin autoplay.
function preparar_carrusel_de_perfumes(track) {
    const region = document.getElementById('featured-carousel');
    if (!region || track.children.length < 2) return;
    const previous = region.querySelector('[data-carousel-previous]');
    const next = region.querySelector('[data-carousel-next]');
    const status = region.querySelector('[data-featured-position]');
    region.querySelector('.featured-products-controls').hidden = false;
    track.classList.add('featured-carousel-track');
    track.tabIndex = 0;
    track.setAttribute('aria-label', 'Productos destacados; usá las flechas para recorrerlos');
    const actualizar_vista = () => {
        const width = track.firstElementChild.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const index = Math.max(0, Math.round(track.scrollLeft / (width + gap)));
        previous.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        status.textContent = `Desde el producto ${index + 1} de ${track.children.length}`;
    };
    const mover_elementos = direction => {
        const amount = track.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
        track.scrollBy({ left: direction * amount, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    previous.addEventListener('click', () => mover_elementos(-1));
    next.addEventListener('click', () => mover_elementos(1));
    track.addEventListener('keydown', event => {
        // no intercepta edicion ni acciones dentro de las tarjetas.
        if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: 'instant' });
        else mover_elementos(event.key === 'ArrowLeft' ? -1 : 1);
    });
    track.addEventListener('scroll', actualizar_vista, { passive: true });
    new ResizeObserver(actualizar_vista).observe(track);
    actualizar_vista();
}
