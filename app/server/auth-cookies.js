// crea y borra cookies de sesion; las opciones seguras dependen del entorno del servidor.
function crear_cookie_de_autenticacion(name, value, max_age, production = process.env.NODE_ENV === 'production') {
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${max_age}${production ? '; Secure' : ''}`;
}
function guardar_cookies_de_sesion(respuesta, current_session, production = process.env.NODE_ENV === 'production', append = false) {
    const age = Number(current_session.expires_in);
    const cookies = [crear_cookie_de_autenticacion('dreams_access_token', current_session.access_token, Number.isSafeInteger(age) && age > 0 ? age : 3600, production), crear_cookie_de_autenticacion('dreams_refresh_token', current_session.refresh_token, 2592000, production)];
    if (append) for (const cookie of cookies) respuesta.append('Set-Cookie', cookie);
    else respuesta.setHeader('Set-Cookie', cookies);
}
module.exports = { auth_cookie: crear_cookie_de_autenticacion, session: guardar_cookies_de_sesion };
