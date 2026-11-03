function auth_cookie(name, value, max_age, production = process.env.NODE_ENV === 'production') {
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${max_age}${production ? '; Secure' : ''}`;
}
function session(response, current_session, production = process.env.NODE_ENV === 'production', append = false) {
    const age = Number(current_session.expires_in);
    const cookies = [auth_cookie('dreams_access_token', current_session.access_token, Number.isSafeInteger(age) && age > 0 ? age : 3600, production), auth_cookie('dreams_refresh_token', current_session.refresh_token, 2592000, production)];
    if (append) for (const cookie of cookies) response.append('Set-Cookie', cookie);
    else response.setHeader('Set-Cookie', cookies);
}
module.exports = { auth_cookie, session };
