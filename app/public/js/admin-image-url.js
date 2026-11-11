// revisa urls de imagen y avisa si el enlace es temporal; no descarga ni guarda archivos.
    function es_url_de_imagen_admitida(value) {
        const candidate = String(value ?? '').trim();
        if (!candidate || /[\\\u0000-\u001f\u007f]/u.test(candidate)) return false;
        if (/^\/(?!\/)/.test(candidate)) return true;
        try {
            const parsed = new URL(candidate);
            const google_page = /(^|\.)google\.[a-z.]+$/.test(parsed.hostname.toLowerCase()) && ['/imgres', '/search'].includes(parsed.pathname);
            return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !google_page;
        } catch { return false; }
    }
    function es_url_de_imagen_temporal(value) {
        try {
            const parsed = new URL(String(value ?? '').trim());
            const keys = new Set([...parsed.searchParams.keys()].map(k => k.toLowerCase()));
            return (parsed.pathname.includes('/storage/v1/object/sign/') && keys.has('token')) ||
                keys.has('x-amz-signature') || keys.has('x-goog-signature') ||
                (keys.has('signature') && keys.has('expires')) || (keys.has('sig') && keys.has('se'));
        } catch { return false; }
    }
const image_helpers = { es_url_de_imagen_admitida, es_url_de_imagen_temporal };
if (typeof module !== 'undefined' && module.exports) module.exports = image_helpers;
else window.DreamsAdminImages = image_helpers;
