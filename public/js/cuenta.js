function notify_account_change() { try { localStorage.setItem('dreams_account_changed', crypto.randomUUID()); } catch {} }

let account_request_id = 0;

async function request_json(url, options = {}) {
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

function set_form_busy(form, busy) {
    form.setAttribute('aria-busy', String(busy));
    for (const element of form.elements) element.disabled = busy;
    for (const id of ['login-tab', 'register-tab']) { const tab = document.getElementById(id); if (tab) tab.disabled = busy; }
    const submit = form.querySelector('[type="submit"]');
    if (!submit) return;
    if (!submit.dataset.label) submit.dataset.label = submit.textContent;
    submit.textContent = busy ? 'Procesando…' : submit.dataset.label;
}

function set_message(element, text, kind = '') {
    element.setAttribute?.('role', kind === 'error' ? 'alert' : 'status');
    element.setAttribute?.('aria-live', kind === 'error' ? 'assertive' : 'polite');
    element.textContent = text;
    element.className = `form-message${kind ? ` ${kind}` : ''}`;
}

function render_account_forms(initial_message = '') {
    const container = document.getElementById('account-view');
    container.innerHTML = `<img class="account-isologo" src="/assets/dreams-isologo-clean.png" alt="DREAMS" width="56" height="79"><h1>Ingresá a DREAMS</h1><button id="google-login" class="button google-login" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"/></svg><span>Continuar con Google</span></button><p id="google-message" class="form-message" role="status">${escape_html(initial_message)}</p><a class="text-button" href="/">Volver a la tienda</a>`;
    document.getElementById('google-login').addEventListener('click', async event => {
        const button = event.currentTarget;
        const message = document.getElementById('google-message');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        set_message(message, 'Conectando con Google…');
        try {
            const next = new URLSearchParams(location.search).get('next');
            const data = await request_json('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ next }) });
            window.location.assign(data.url);
        } catch (error) {
            set_message(message, error.message, 'error');
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    });
}

function legacy_account_markup(initial_message, confirmation_required = true) {
    return `
        <img class="account-isologo" src="/assets/dreams-isologo-clean.png" alt="DREAMS" width="56" height="79"><h1>Ingresá a DREAMS</h1>
        <div class="account-tabs" role="tablist" aria-label="Acceso a la cuenta"><button id="login-tab" type="button" role="tab" aria-controls="login-form" aria-selected="true" class="active">Iniciar sesión</button><button id="register-tab" type="button" role="tab" aria-controls="register-form" aria-selected="false" tabindex="-1">Crear cuenta</button></div>
        <form id="login-form" role="tabpanel" aria-labelledby="login-tab" novalidate>
            <div class="form-field"><label for="login-email">Correo electrónico</label><input id="login-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required></div>
            <div class="form-field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required></div>
            <div class="form-message" id="login-message" role="status" aria-live="polite">${escape_html(initial_message)}</div><button class="button button-dark account-submit" type="submit">Ingresar</button>
        </form>
        <form id="register-form" role="tabpanel" aria-labelledby="register-tab" hidden novalidate>${confirmation_required ? '<p class="registration-notice">Si recibís un correo de confirmación, abrilo antes de ingresar.</p>' : ''}<div class="form-grid">
            <div class="form-field full"><label for="register-name">Nombre</label><input id="register-name" name="name" autocomplete="name" maxlength="80" required></div>
            <div class="form-field full"><label for="register-email">Correo electrónico</label><input id="register-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required></div>
            <div class="form-field"><label for="register-password">Contraseña</label><input id="register-password" name="password" type="password" aria-describedby="register-password-help" autocomplete="new-password" minlength="8" maxlength="128" required><small id="register-password-help">Usá entre 8 y 128 caracteres.</small></div>
            <div class="form-field"><label for="register-confirm">Repetir contraseña</label><input id="register-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></div>
        </div><div class="form-message" id="register-message" role="status" aria-live="polite"></div><button class="button button-dark account-submit" type="submit">Crear cuenta</button></form>
    `;
}

function render_legacy_forms(initial_message = '', confirmation_required = true) {
    document.getElementById('account-view').innerHTML = legacy_account_markup(initial_message, confirmation_required);
    for (const id of ['login-form', 'register-form']) setup_account_validation(document.getElementById(id));
    setup_account_tabs();
    document.getElementById('login-tab').addEventListener('click', () => switch_account_form('login'));
    document.getElementById('register-tab').addEventListener('click', () => switch_account_form('register'));
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('register-form').addEventListener('submit', register);
}

function switch_account_form(mode, focus_field = true) {
    if (document.querySelector('.account-card form[aria-busy="true"]')) return;
    for (const id of ['login-form', 'register-form']) reset_form_errors(document.getElementById(id));
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

async function submit_login(form, message, body) {
    set_message(message, 'Verificando tus datos…');
    set_form_busy(form, true);
    try {
        const data = await request_json('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!data.authenticated) throw new Error('No pudimos iniciar la sesión. Intentá nuevamente.');
        notify_account_change();
        window.location.replace(data.redirect || '/cuenta.html');
    } catch (error) {
        set_message(message, error.message, 'error');
        if (error.field) set_field_error(form.elements.namedItem(error.field), error.message);
    } finally { set_form_busy(form, false); }
}

async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.getAttribute('aria-busy') === 'true' || !validate_account_form(form)) return;
    await submit_login(form, document.getElementById('login-message'), {
        email: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value
    });
}

function registration_body(form, message) {
    if (!validate_account_form(form)) return null;
    const password = document.getElementById('register-password').value;
    if (password !== document.getElementById('register-confirm').value) {
        set_message(message, 'Las contraseñas no coinciden.', 'error');
        set_field_error(document.getElementById('register-confirm'), 'Las contraseñas no coinciden.');
        document.getElementById('register-confirm').focus();
        return null;
    }
    return { name: document.getElementById('register-name').value.trim(), email: document.getElementById('register-email').value.trim(), password };
}

async function submit_registration(form, message, body) {
    set_message(message, 'Creando tu cuenta…');
    set_form_busy(form, true);
    try {
        const data = await request_json('/api/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!data.authenticated) {
            set_message(message, data.message || 'No pudimos iniciar tu sesión. Probá ingresar nuevamente.', 'error');
            return;
        }
        set_message(message, data.message || 'Cuenta creada correctamente. Ya ingresaste a DREAMS.', 'success');
        notify_account_change();
        window.location.replace('/cuenta.html');
    } catch (error) {
        set_message(message, error.message, 'error');
        if (['name', 'email', 'password'].includes(error.field)) set_field_error(form.elements.namedItem(error.field), error.message);
    } finally {
        set_form_busy(form, false);
    }
}

async function register(event) {
    event.preventDefault();
    const form = event.currentTarget;
    // También bloquear envíos programáticos mientras la petición está pendiente.
    if (form.getAttribute('aria-busy') === 'true') return;
    const message = document.getElementById('register-message');
    const body = registration_body(form, message);
    if (body) await submit_registration(form, message, body);
}

function logged_account_markup(user) {
    return `<p class="eyebrow">SESIÓN ACTIVA</p><h2>${escape_html(user.name)}</h2>
        <p class="account-lead">Ingresaste con <strong>${escape_html(user.email)}</strong>.</p>
        <div class="account-status"><span aria-hidden="true"></span><p>Tu cuenta está lista para publicar opiniones${user.is_admin ? ' y administrar el catálogo' : ''}.</p></div>
        ${user.is_admin ? '<a class="button button-dark account-submit" href="/admin">Abrir panel de administración</a>' : '<a class="button account-submit" href="/catalogo.html">Explorar la colección</a>'}
        <button id="logout-button" class="text-button" type="button">Cerrar sesión</button><div class="form-message" id="logout-message" role="status" aria-live="polite"></div>`;
}

async function logout_account(event) {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    const message = document.getElementById('logout-message');
    set_message(message, 'Cerrando sesión…');
    try {
        await request_json('/api/auth/logout', { method: 'POST' });
        if (typeof account_cart !== 'undefined') account_cart?.logout();
        notify_account_change(); window.location.replace('/cuenta.html');
    }
    catch (error) { set_message(message, error.message, 'error'); button.disabled = false; }
}

function render_logged_user(user) {
    document.getElementById('account-view').innerHTML = logged_account_markup(user);
    document.getElementById('logout-button').addEventListener('click', logout_account);
}

function render_account_error() {
    const container = document.getElementById('account-view');
    container.innerHTML = '<p class="eyebrow">CONEXIÓN</p><h2>No pudimos comprobar tu sesión</h2><p class="account-lead">Podés volver a intentarlo. No se modificó ningún dato de tu cuenta.</p><button id="retry-account" class="button button-dark account-submit" type="button">Reintentar</button>';
    document.getElementById('retry-account').addEventListener('click', init_account);
}

async function init_account() {
    const request_id = ++account_request_id;
    try {
        const data = await request_json('/api/auth/me');
        if (request_id !== account_request_id) return;
        if (data.user) render_logged_user(data.user);
        else {
            const params = new URLSearchParams(window.location.search);
            const [google, settings] = await Promise.all([request_json('/api/auth/google/config').catch(() => ({ enabled: false })), request_json('/api/auth/config').catch(() => ({ email_confirmation_required: true }))]);
            if (request_id !== account_request_id) return;
            const render = google.enabled ? render_account_forms : render_legacy_forms;
            render(params.has('auth_error') ? 'El ingreso fue cancelado o no pudo completarse. Volvé a intentarlo.' : params.has('admin') ? 'Ingresá con una cuenta administradora para continuar.' : '', settings.email_confirmation_required !== false);
        }
    } catch {
        if (request_id === account_request_id) render_account_error();
    }
}

function restore_account_page(event) {
    if (!event.persisted) return;
    document.getElementById('account-view').replaceChildren();
    init_account();
}

document.addEventListener('DOMContentLoaded', init_account);
window.addEventListener('pageshow', restore_account_page);

function set_field_error(input, message = '') {
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

function field_validation_message(input) {
    const value = input.value;
    if (!value.trim()) return 'Completá este campo.';
    if (input.name === 'name' && value.trim().length > 80) return 'Usá un nombre de hasta 80 caracteres.';
    if (input.type === 'email' && (value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))) return 'Ingresá un correo electrónico válido.';
    if (input.type === 'password' && (value.length < 8 || value.length > 128)) return 'Usá una contraseña de 8 a 128 caracteres.';
    return '';
}

function reset_form_errors(form) {
    for (const input of form.querySelectorAll('input')) set_field_error(input);
    const message = form.querySelector('.form-message');
    if (message) set_message(message, '');
}

function validate_account_form(form) {
    reset_form_errors(form);
    let first;
    for (const input of form.querySelectorAll('input')) {
        const message = field_validation_message(input);
        set_field_error(input, message);
        if (message && !first) first = input;
    }
    if (!first) return true;
    first.focus();
    set_message(form.querySelector('.form-message'), field_validation_message(first), 'error');
    return false;
}

function setup_account_validation(form) {
    for (const input of form.querySelectorAll('input')) {
        set_field_error(input);
        input.addEventListener('input', () => set_field_error(input));
    }
}

function setup_account_tabs() {
    for (const id of ['login-tab', 'register-tab']) document.getElementById(id).addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const login = event.key === 'Home' || (event.key !== 'End' && id === 'register-tab');
        switch_account_form(login ? 'login' : 'register', false);
        document.getElementById(login ? 'login-tab' : 'register-tab').focus();
    });
}
