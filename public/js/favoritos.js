async function load_favorites() {
    const container = document.getElementById('favorites-products');

    try {
        const response = await fetch('/api/favorites');
        const products = await response.json();

        if (!response.ok) {
            container.innerHTML = '<div class="empty-state"><h2>Iniciá sesión para ver tus favoritos.</h2><a class="button button-dark" href="/cuenta.html">Iniciar sesión</a></div>';
            return;
        }

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-state"><h2>Todavía no tenés favoritos.</h2><p>Guardá los perfumes que quieras volver a mirar.</p><a class="button button-dark" href="/catalogo.html">Explorar perfumes</a></div>';
            return;
        }

        products.forEach(product => {
            const card = create_product_card(product);
            const favorite_button = card.querySelector('.favorite-button');
            favorite_button.classList.add('active');
            favorite_button.textContent = '♥';
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<div class="empty-state"><h2>No se pudieron cargar tus favoritos.</h2></div>';
    }
}

document.addEventListener('DOMContentLoaded', load_favorites);
