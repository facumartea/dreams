/* Los permisos llegan del servidor; nunca se deducen de nombres o correos. */
class DreamsReviews {
    constructor() { this.load_id = 0; this.pending = null; }
    async request(path, options) {
        const response = await fetch('/api/reviews' + path, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación.');
        return data;
    }
    card(review) {
        const article = document.createElement('article'); article.className = 'review-card';
        const rating = Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 ? review.rating : 0;
        article.innerHTML = `<div class="review-stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div><p>“${escape_html(review.comment)}”</p><div class="review-author">${escape_html(review.user_name)}</div>`;
        if (review.can_delete === true) this.add_delete(article, review.id);
        return article;
    }
    add_delete(article, id) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'text-button'; button.textContent = 'Eliminar';
        button.setAttribute('aria-label', 'Eliminar mi opinión');
        button.addEventListener('click', () => this.remove(id, button)); article.appendChild(button);
    }
    async remove(id, button) {
        if (button.disabled || !window.confirm('¿Querés eliminar tu opinión? Esta acción no se puede deshacer.')) return;
        button.disabled = true;
        const status = document.getElementById('review-status');
        try { await this.request('/' + id, { method: 'DELETE' }); status.textContent = 'Tu opinión fue eliminada.'; await this.load(); }
        catch (error) { status.textContent = interface_error(error); button.disabled = false; }
    }
    async load() {
        const container = document.getElementById('reviews'); if (!container) return;
        const epoch = ++this.load_id;
        try {
            const reviews = await this.request('');
            if (epoch !== this.load_id) return;
            if (!Array.isArray(reviews)) throw new Error('No se pudieron cargar las opiniones.');
            container.replaceChildren(...reviews.filter((review, index) => index < 3 || review.can_delete === true).map(review => this.card(review)));
            if (!reviews.length) container.innerHTML = '<div class="empty-state"><h2>La comunidad recién empieza.</h2><p>Las primeras opiniones verificadas van a aparecer acá.</p></div>';
        } catch (error) { if (epoch === this.load_id) container.textContent = interface_error(error); }
    }
    submission(form) {
        const rating = Number(form.elements.rating.value), comment = form.elements.comment.value.trim();
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 1000) throw new Error('Elegí una puntuación y escribí una opinión de hasta 1000 caracteres.');
        if (!this.pending || this.pending.rating !== rating || this.pending.comment !== comment) this.pending = { rating, comment, operation_id: crypto.randomUUID() };
        return this.pending;
    }
    async publish(event) {
        event.preventDefault(); const form = event.currentTarget;
        if (form.getAttribute('aria-busy') === 'true') return;
        const status = document.getElementById('review-status'), button = form.querySelector('button[type="submit"]');
        let body; try { body = this.submission(form); } catch (error) { status.textContent = interface_error(error); return; }
        form.setAttribute('aria-busy', 'true'); button.disabled = true; status.textContent = 'Publicando…';
        try {
            await this.request('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            this.pending = null; form.reset(); status.textContent = 'Tu opinión fue publicada y guardada.'; await this.load();
        } catch (error) { status.textContent = interface_error(error); }
        finally { form.removeAttribute('aria-busy'); button.disabled = false; }
    }
    async setup() {
        const form = document.getElementById('review-form'), access = document.getElementById('review-access');
        if (!form || !access) return;
        try {
            const response = await fetch('/api/auth/me'), data = await response.json();
            if (!response.ok) throw new Error('No se pudo comprobar tu sesión. Recargá la página para volver a intentar.');
            if (!data.user) { access.innerHTML = 'Para publicar necesitás <a href="/cuenta.html">iniciar sesión o crear una cuenta</a>.'; return; }
            access.textContent = `Publicás como ${data.user.name.includes('@') ? 'Cliente' : data.user.name}.`; form.hidden = false;
            form.addEventListener('submit', event => this.publish(event));
        } catch (error) { access.textContent = interface_error(error); }
    }
    start() { this.load(); this.setup(); }
}
const dreams_reviews = new DreamsReviews();
