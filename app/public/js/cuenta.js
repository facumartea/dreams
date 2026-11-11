// coordina registro, login y logout; bloquea envios repetidos y muestra errores de la api.
function avisar_cambio_de_cuenta() { try { localStorage.setItem('dreams_account_changed', crypto.randomUUID()); } catch {} }

let account_request_id = 0;

async function solicitar_json(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error('No pudimos conectar con DREAMS. Revisá tu conexión e intentá nuevamente.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(data.error || 'No se pudo completar la operación.'); error.field = data.field; throw error; }
    return data;
}

function indicar_envio_en_curso(form, busy) {
    form.setAttribute('aria-busy', String(busy));
    for (const element of form.elements) element.disabled = busy;
    for (const id of ['login-tab', 'register-tab']) { const tab = document.getElementById(id); if (tab) tab.disabled = busy; }
    const submit = form.querySelector('[type="submit"]');
    if (!submit) return;
    if (!submit.dataset.label) submit.dataset.label = submit.textContent;
    submit.textContent = busy ? 'Procesando…' : submit.dataset.label;
}

function mostrar_mensaje(element, text, kind = '') {
    element.setAttribute?.('role', kind === 'error' ? 'alert' : 'status');
    element.setAttribute?.('aria-live', kind === 'error' ? 'assertive' : 'polite');
    element.textContent = text;
    element.className = `form-message${kind ? ` ${kind}` : ''}`;
}

function mostrar_formularios_de_cuenta(initial_message = '') {
    const container = document.getElementById('account-view');
    container.innerHTML = `<img class="account-isologo" src="/assets/dreams-isologo-clean.png" alt="DREAMS" width="56" height="79"><h1>Ingresá a DREAMS</h1><button id="google-login" class="button google-login" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"/></svg><span>Continuar con Google</span></button><p id="google-message" class="form-message" role="status">${escapar_texto_html(initial_message)}</p><a class="text-button" href="/">Volver a la tienda</a>`;
    document.getElementById('google-login').addEventListener('click', async event => {
        const button = event.currentTarget;
        const message = document.getElementById('google-message');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        mostrar_mensaje(message, 'Conectando con Google…');
        try {
            const next = new URLSearchParams(location.search).get('next');
            const data = await solicitar_json('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ next }) });
            window.location.assign(data.url);
        } catch (error) {
            mostrar_mensaje(message, error.message, 'error');
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    });
}

function crear_vista_anterior_de_cuenta(initial_message, confirmation_required = true) {
    return `
        <img class="account-isologo" src="/assets/dreams-isologo-clean.png" alt="DREAMS" width="56" height="79"><h1>Ingresá a DREAMS</h1>
        <div class="account-tabs" role="tablist" aria-label="Acceso a la cuenta"><button id="login-tab" type="button" role="tab" aria-controls="login-form" aria-selected="true" class="active">Iniciar sesión</button><button id="register-tab" type="button" role="tab" aria-controls="register-form" aria-selected="false" tabindex="-1">Crear cuenta</button></div>
        <form id="login-form" role="tabpanel" aria-labelledby="login-tab" novalidate>
            <div class="form-field"><label for="login-email">Correo electrónico</label><input id="login-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required></div>
            <div class="form-field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required></div>
            <div class="form-message" id="login-message" role="status" aria-live="polite">${escapar_texto_html(initial_message)}</div><button class="button button-dark account-submit" type="submit">Ingresar</button>
        </form>
        <form id="register-form" role="tabpanel" aria-labelledby="register-tab" hidden novalidate>${confirmation_required ? '<p class="registration-notice">Si recibís un correo de confirmación, abrilo antes de ingresar.</p>' : ''}<div class="form-grid">
            <div class="form-field full"><label for="register-name">Nombre</label><input id="register-name" name="name" autocomplete="name" maxlength="80" required></div>
            <div class="form-field full"><label for="register-email">Correo electrónico</label><input id="register-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required></div>
            <div class="form-field"><label for="register-password">Contraseña</label><input id="register-password" name="password" type="password" aria-describedby="register-password-help" autocomplete="new-password" minlength="8" maxlength="128" required><small id="register-password-help">Usá entre 8 y 128 caracteres.</small></div>
            <div class="form-field"><label for="register-confirm">Repetir contraseña</label><input id="register-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></div>
        </div><div class="form-message" id="register-message" role="status" aria-live="polite"></div><button class="button button-dark account-submit" type="submit">Crear cuenta</button></form>
    `;
}

function mostrar_formularios_del_modo_anterior(initial_message = '', confirmation_required = true) {
    document.getElementById('account-view').innerHTML = crear_vista_anterior_de_cuenta(initial_message, confirmation_required);
    for (const id of ['login-form', 'register-form']) preparar_validacion_de_cuenta(document.getElementById(id));
    preparar_pestanas_de_cuenta();
    document.getElementById('login-tab').addEventListener('click', () => cambiar_formulario_de_cuenta('login'));
    document.getElementById('register-tab').addEventListener('click', () => cambiar_formulario_de_cuenta('register'));
    document.getElementById('login-form').addEventListener('submit', iniciar_sesion_desde_formulario);
    document.getElementById('register-form').addEventListener('submit', registrar);
}

function cambiar_formulario_de_cuenta(mode, focus_field = true) {
    if (document.querySelector('.account-card form[aria-busy="true"]')) return;
    for (const id of ['login-form', 'register-form']) limpiar_errores_del_formulario(document.getElementById(id));
    const is_login = mode === 'login';
    const login_tab = document.getElementById('login-tab');
    const register_tab = document.getElementById('register-tab');
    login_tab.classList.toggle('active', is_login);
    register_tab.classList.toggle('active', !is_login);
    login_tab.setAttribute('aria-selected', String(is_login));
    register_tab.setAttribute('aria-selected', String(!is_login));
    login_tab.tabIndex = is_login ? 0 : -1; register_tab.tabIndex = is_login ? -1 : 0;
    document.getElementById('login-form').hidden = !is_login;
    document.getElementById('register-form').hidden = is_login;
    if (focus_field) requestAnimationFrame(() => document.getElementById(is_login ? 'login-email' : 'register-name').focus());
}

// envia al servidor y solo redirige si la respuesta confirma una sesion.
async function enviar_inicio_de_sesion(form, message, body) {
    mostrar_mensaje(message, 'Verificando tus datos…');
    indicar_envio_en_curso(form, true);
    try {
        const data = await solicitar_json('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!data.authenticated) throw new Error('No pudimos iniciar la sesión. Intentá nuevamente.');
        avisar_cambio_de_cuenta();
        window.location.replace(data.redirect || '/cuenta.html');
    } catch (error) {
        mostrar_mensaje(message, error.message, 'error');
        if (error.field) mostrar_error_del_campo(form.elements.namedItem(error.field), error.message);
    } finally { indicar_envio_en_curso(form, false); }
}

async function iniciar_sesion_desde_formulario(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.getAttribute('aria-busy') === 'true' || !validar_formulario_de_cuenta(form)) return;
    await enviar_inicio_de_sesion(form, document.getElementById('login-message'), {
        email: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value
    });
}

// comprueba campos y repeticion de contrasena antes de construir el cuerpo del registro.
function preparar_datos_de_registro(form, message) {
    if (!validar_formulario_de_cuenta(form)) return null;
    const password = document.getElementById('register-password').value;
    if (password !== document.getElementById('register-confirm').value) {
        mostrar_mensaje(message, 'Las contraseñas no coinciden.', 'error');
        mostrar_error_del_campo(document.getElementById('register-confirm'), 'Las contraseñas no coinciden.');
        document.getElementById('register-confirm').focus();
        return null;
    }
    return { name: document.getElementById('register-name').value.trim(), email: document.getElementById('register-email').value.trim(), password };
}

function completar_registro(message, data) {
    if (!data.authenticated) {
        mostrar_mensaje(message, data.message || 'No pudimos iniciar tu sesión. Probá ingresar nuevamente.', 'error');
        return;
    }
    mostrar_mensaje(message, data.message || 'Cuenta creada correctamente. Ya ingresaste a DREAMS.', 'success');
    avisar_cambio_de_cuenta();
    window.location.replace('/cuenta.html');
}

// bloquea el formulario durante la solicitud y devuelve los controles ante un error.
async function enviar_registro(form, message, body) {
    mostrar_mensaje(message, 'Creando tu cuenta…');
    indicar_envio_en_curso(form, true);
    try {
        const data = await solicitar_json('/api/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        completar_registro(message, data);
    } catch (error) {
        mostrar_mensaje(message, error.message, 'error');
        if (['name', 'email', 'password'].includes(error.field)) mostrar_error_del_campo(form.elements.namedItem(error.field), error.message);
    } finally {
        indicar_envio_en_curso(form, false);
    }
}

async function registrar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    // tambien bloquear envios programaticos mientras la peticion esta pendiente.
    if (form.getAttribute('aria-busy') === 'true') return;
    const message = document.getElementById('register-message');
    const body = preparar_datos_de_registro(form, message);
    if (body) await enviar_registro(form, message, body);
}

function crear_vista_de_cuenta_con_sesion(user) {
    return `<p class="eyebrow">SESIÓN ACTIVA</p><h2>${escapar_texto_html(user.name)}</h2>
        <p class="account-lead">Ingresaste con <strong>${escapar_texto_html(user.email)}</strong>.</p>
        <div class="account-status"><span aria-hidden="true"></span><p>Tu cuenta está lista para publicar opiniones${user.is_admin ? ' y administrar el catálogo' : ''}.</p></div>
        ${user.is_admin ? '<a class="button button-dark account-submit" href="/admin">Abrir panel de administración</a>' : '<a class="button account-submit" href="/catalogo.html">Explorar la colección</a>'}
        <button id="logout-button" class="text-button" type="button">Cerrar sesión</button><div class="form-message" id="logout-message" role="status" aria-live="polite"></div>`;
}

async function cerrar_sesion_de_la_cuenta(event) {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    const message = document.getElementById('logout-message');
    mostrar_mensaje(message, 'Cerrando sesión…');
    try {
        await solicitar_json('/api/auth/logout', { method: 'POST' });
        if (typeof account_cart !== 'undefined') account_cart?.logout();
        avisar_cambio_de_cuenta(); window.location.replace('/cuenta.html');
    }
    catch (error) { mostrar_mensaje(message, error.message, 'error'); button.disabled = false; }
}

function mostrar_cuenta_con_sesion(user) {
    document.getElementById('account-view').innerHTML = crear_vista_de_cuenta_con_sesion(user);
    document.getElementById('logout-button').addEventListener('click', cerrar_sesion_de_la_cuenta);
}

function mostrar_error_de_cuenta() {
    const container = document.getElementById('account-view');
    container.innerHTML = '<p class="eyebrow">CONEXIÓN</p><h2>No pudimos comprobar tu sesión</h2><p class="account-lead">Podés volver a intentarlo. No se modificó ningún dato de tu cuenta.</p><button id="retry-account" class="button button-dark account-submit" type="button">Reintentar</button>';
    document.getElementById('retry-account').addEventListener('click', iniciar_cuenta);
}

async function iniciar_cuenta() {
    const request_id = ++account_request_id;
    try {
        const data = await solicitar_json('/api/auth/me');
        if (request_id !== account_request_id) return;
        if (data.user) mostrar_cuenta_con_sesion(data.user);
        else {
            const params = new URLSearchParams(window.location.search);
            const [google, settings] = await Promise.all([solicitar_json('/api/auth/google/config').catch(() => ({ enabled: false })), solicitar_json('/api/auth/config').catch(() => ({ email_confirmation_required: true }))]);
            if (request_id !== account_request_id) return;
            const render = google.enabled ? mostrar_formularios_de_cuenta : mostrar_formularios_del_modo_anterior;
            render(params.has('auth_error') ? 'El ingreso fue cancelado o no pudo completarse. Volvé a intentarlo.' : params.has('admin') ? 'Ingresá con una cuenta administradora para continuar.' : '', settings.email_confirmation_required !== false);
        }
    } catch {
        if (request_id === account_request_id) mostrar_error_de_cuenta();
    }
}

function recuperar_pagina_de_cuenta(event) {
    if (!event.persisted) return;
    document.getElementById('account-view').replaceChildren();
    iniciar_cuenta();
}

document.addEventListener('DOMContentLoaded', iniciar_cuenta);
window.addEventListener('pageshow', recuperar_pagina_de_cuenta);

function mostrar_error_del_campo(input, message = '') {
    if (!input) return;
    const id = input.id + '-error';
    let error = document.getElementById(id);
    if (!error) {
        error = document.createElement('span'); error.id = id; error.className = 'field-error';
        input.insertAdjacentElement('afterend', error);
        input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    }
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
}

function explicar_error_del_campo(input) {
    const value = input.value;
    if (!value.trim()) return 'Completá este campo.';
    if (input.name === 'name' && value.trim().length > 80) return 'Usá un nombre de hasta 80 caracteres.';
    if (input.type === 'email' && (value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))) return 'Ingresá un correo electrónico válido.';
    if (input.type === 'password' && (value.length < 8 || value.length > 128)) return 'Usá una contraseña de 8 a 128 caracteres.';
    return '';
}

function limpiar_errores_del_formulario(form) {
    for (const input of form.querySelectorAll('input')) mostrar_error_del_campo(input);
    const message = form.querySelector('.form-message');
    if (message) mostrar_mensaje(message, '');
}

function validar_formulario_de_cuenta(form) {
    limpiar_errores_del_formulario(form);
    let first;
    for (const input of form.querySelectorAll('input')) {
        const message = explicar_error_del_campo(input);
        mostrar_error_del_campo(input, message);
        if (message && !first) first = input;
    }
    if (!first) return true;
    first.focus();
    mostrar_mensaje(form.querySelector('.form-message'), explicar_error_del_campo(first), 'error');
    return false;
}

function preparar_validacion_de_cuenta(form) {
    for (const input of form.querySelectorAll('input')) {
        mostrar_error_del_campo(input);
        input.addEventListener('input', () => mostrar_error_del_campo(input));
    }
}

function preparar_pestanas_de_cuenta() {
    for (const id of ['login-tab', 'register-tab']) document.getElementById(id).addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const login = event.key === 'Home' || (event.key !== 'End' && id === 'register-tab');
        cambiar_formulario_de_cuenta(login ? 'login' : 'register', false);
        document.getElementById(login ? 'login-tab' : 'register-tab').focus();
    });
}
