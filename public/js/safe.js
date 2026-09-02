(function expose_safe_helpers(root) {
    const fallback_image = '/assets/dreams-bottle.png';

    function escape_html(value) {
        return String(value ?? '').replace(/[&<>'"]/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        })[character]);
    }

    function safe_image_url(value) {
        const candidate = String(value ?? '').trim();
        if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
        try {
            const parsed = new URL(candidate);
            return parsed.protocol === 'https:' ? parsed.href : fallback_image;
        } catch (error) {
            return fallback_image;
        }
    }

    function attach_image_fallback(image) {
        image.addEventListener('error', () => {
            image.dataset.imageError = 'true';
            image.alt = 'Imagen no disponible';
            const container = image.parentElement;
            if (container && !container.querySelector('.image-load-error')) {
                const message = document.createElement('span');
                message.className = 'image-load-error';
                message.textContent = 'Imagen no disponible';
                container.appendChild(message);
            }
            if (image.getAttribute('src') !== fallback_image) image.setAttribute('src', fallback_image);
        }, { once: true });
    }

    const helpers = { escape_html, safe_image_url, attach_image_fallback, fallback_image };
    Object.assign(root, helpers);
    if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
})(typeof window === 'undefined' ? globalThis : window);
