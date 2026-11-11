const { rateLimit } = require('express-rate-limit');

function auth_limiters() {
    const safe = request => ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    const common = { standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } };
    // Consultar la sesión al navegar no consume los 20 intentos de ingreso/registro.
    return [
        rateLimit({ ...common, windowMs: 900000, limit: 20, skip: safe }),
        rateLimit({ ...common, windowMs: 60000, limit: 120, skip: request => !safe(request) })
    ];
}

module.exports = { auth_limiters };
