// limita intentos de autenticacion sin gastar ese limite al consultar una sesion existente.
const { rateLimit } = require('express-rate-limit');

function crear_limites_de_autenticacion() {
    const proteger_valor = solicitud => ['GET', 'HEAD', 'OPTIONS'].includes(solicitud.method);
    const common = { standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } };
    // consultar la sesion al navegar no consume los 20 intentos de ingreso/registro.
    return [
        rateLimit({ ...common, windowMs: 900000, limit: 20, skip: proteger_valor }),
        rateLimit({ ...common, windowMs: 60000, limit: 120, skip: solicitud => !proteger_valor(solicitud) })
    ];
}

module.exports = { auth_limiters: crear_limites_de_autenticacion };
