// escapa texto antes de insertarlo en html y descarta urls de imagen no permitidas.
// helpers compartidos por navegador y pruebas node.
const fallback_image = '/assets/dreams-bottle.png';

function escapar_texto_html(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[character]);
}

function elegir_url_de_imagen_segura(value) {
    const candidate = String(value ?? '').trim();
    if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
    try {
        const parsed = new URL(candidate);
        return parsed.protocol === 'https:' ? parsed.href : fallback_image;
    } catch (error) {
        return fallback_image;
    }
}

function preparar_imagen_alternativa(image) {
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

function explicar_error_de_conexion(error) {
    if (error?.name === 'TypeError' || error?.name === 'SyntaxError') return 'No pudimos completar la solicitud. Revisá tu conexión e intentá nuevamente.';
    return error?.message || 'No se pudo completar la operación. Volvé a intentarlo.';
}

function explicar_error_de_validacion(field) {
    const validity = field.validity;
    if (validity.valueMissing) return 'Completá este campo.';
    if (validity.typeMismatch) return field.type === 'email' ? 'Ingresá un correo electrónico válido.' : 'Ingresá un valor válido.';
    if (validity.tooShort) return `Usá al menos ${field.minLength} caracteres.`;
    if (validity.tooLong) return `Usá hasta ${field.maxLength} caracteres.`;
    if (validity.rangeUnderflow) return `Ingresá un valor mayor o igual a ${field.min}.`;
    if (validity.rangeOverflow) return `Ingresá un valor menor o igual a ${field.max}.`;
    if (validity.patternMismatch || validity.stepMismatch || validity.badInput) return 'Revisá el formato de este campo.';
    return '';
}

if (typeof document !== 'undefined') {
    document.addEventListener('invalid', event => {
        if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity(explicar_error_de_validacion(event.target));
    }, true);
    for (const type of ['input', 'change']) document.addEventListener(type, event => {
        if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    });
}

const helpers = { escapar_texto_html, elegir_url_de_imagen_segura, preparar_imagen_alternativa, fallback_image, explicar_error_de_conexion, explicar_error_de_validacion };
Object.assign(typeof window === 'undefined' ? globalThis : window, helpers);
if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
