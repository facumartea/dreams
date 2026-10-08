async function request_json(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error('No pudimos conectar con DREAMS. Revisá tu conexión e intentá nuevamente.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación.');
    return data;
}

function set_form_busy(form, busy) {
    form.setAttribute('aria-busy', String(busy));
    for (const element of form.elements) element.disabled = busy;
    const submit = form.querySelector('[type="submit"]');
    if (!submit) return;
    if (!submit.dataset.label) submit.dataset.label = submit.textContent;
    submit.textContent = busy ? 'Procesando…' : submit.dataset.label;
}

function set_message(element, text, kind = '') {
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

function render_legacy_forms(initial_message = '', demo = false) {
    const container = document.getElementById('account-view');
    container.innerHTML = `
        <img class="account-isologo" src="/assets/dreams-isologo-clean.png" alt="DREAMS" width="56" height="79"><h1>Ingresá a DREAMS</h1>
        <div class="account-tabs" role="tablist" aria-label="Acceso a la cuenta">
            <button id="login-tab" type="button" role="tab" aria-controls="login-form" aria-selected="true" class="active">Iniciar sesión</button>
            <button id="register-tab" type="button" role="tab" aria-controls="register-form" aria-selected="false">Crear cuenta</button>
        </div>
        <form id="login-form" role="tabpanel" aria-labelledby="login-tab" novalidate>
            <div class="form-field"><label for="login-email">Correo electrónico</label><input id="login-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>
            <div class="form-field"><label for="login-password">Contraseña</label><input id="login-password" name="password" type="password" autocomplete="current-password" minlength="8" maxlength="128" required></div>
            <div class="form-message" id="login-message" role="status" aria-live="polite">${escape_html(initial_message)}</div>
            <button class="button button-dark account-submit" type="submit">Ingresar</button>
        </form>
        <form id="register-form" role="tabpanel" aria-labelledby="register-tab" hidden novalidate>
            ${demo ? '<p class="demo-auth-note"><strong>Modo de prueba:</strong> tu cuenta queda activa al instante; no necesitás confirmar el correo.</p>' : '<p>Si recibís un correo de confirmación, abrilo antes de ingresar.</p>'}
            <div class="form-grid">
                <div class="form-field full"><label for="register-name">Nombre</label><input id="register-name" name="name" autocomplete="name" maxlength="80" required></div>
                <div class="form-field full"><label for="register-email">Correo electrónico</label><input id="register-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>
                <div class="form-field"><label for="register-password">Contraseña</label><input id="register-password" name="password" type="password" autocomplete="new-password" minlength="8" maxlength="128" required><small>Usá entre 8 y 128 caracteres.</small></div>
                <div class="form-field"><label for="register-confirm">Repetir contraseña</label><input id="register-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></div>
            </div>
            <div class="form-message" id="register-message" role="status" aria-live="polite"></div>
            <button class="button button-dark account-submit" type="submit">Crear cuenta</button>
        </form>
    `;
    document.getElementById('login-tab').addEventListener('click', () => switch_account_form('login'));
    document.getElementById('register-tab').addEventListener('click', () => switch_account_form('register'));
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('register-form').addEventListener('submit', register);
}

function switch_account_form(mode) {
    const is_login = mode === 'login';
    const login_tab = document.getElementById('login-tab');
    const register_tab = document.getElementById('register-tab');
    login_tab.classList.toggle('active', is_login);
    register_tab.classList.toggle('active', !is_login);
    login_tab.setAttribute('aria-selected', String(is_login));
    register_tab.setAttribute('aria-selected', String(!is_login));
    document.getElementById('login-form').hidden = !is_login;
    document.getElementById('register-form').hidden = is_login;
    requestAnimationFrame(() => document.getElementById(is_login ? 'login-email' : 'register-name').focus());
}

async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('login-message');
    if (!form.reportValidity()) return;
    set_message(message, 'Verificando tus datos…');
    set_form_busy(form, true);
    try {
        const data = await request_json('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value })
        });
        set_message(message, data.message || 'Sesión iniciada.', 'success');
        window.location.assign(data.redirect || '/cuenta.html');
    } catch (error) {
        set_message(message, error.message, 'error');
        set_form_busy(form, false);
        document.getElementById('login-password').focus();
    }
}

async function register(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('register-message');
    const password = document.getElementById('register-password').value;
    if (!form.reportValidity()) return;
    if (password !== document.getElementById('register-confirm').value) {
        set_message(message, 'Las contraseñas no coinciden.', 'error');
        document.getElementById('register-confirm').focus();
        return;
    }
    set_message(message, 'Creando tu cuenta…');
    set_form_busy(form, true);
    try {
        const data = await request_json('/api/auth/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: document.getElementById('register-name').value.trim(), email: document.getElementById('register-email').value.trim(), password })
        });
        set_message(message, data.message || 'Cuenta creada correctamente.', 'success');
        if (data.authenticated) return window.location.assign('/cuenta.html');
        form.reset();
        set_form_busy(form, false);
    } catch (error) {
        set_message(message, error.message, 'error');
        set_form_busy(form, false);
    }
}

function render_logged_user(user) {
    const container = document.getElementById('account-view');
    container.innerHTML = `
        <p class="eyebrow">SESIÓN ACTIVA</p>
        <h2>${escape_html(user.name)}</h2>
        <p class="account-lead">Ingresaste con <strong>${escape_html(user.email)}</strong>.</p>
        <div class="account-status"><span aria-hidden="true"></span><p>Tu cuenta está lista para publicar opiniones${user.is_admin ? ' y administrar el catálogo' : ''}.</p></div>
        ${user.is_admin ? '<a class="button button-dark account-submit" href="/admin">Abrir panel de administración</a>' : '<a class="button account-submit" href="/catalogo.html">Explorar la colección</a>'}
        <button id="logout-button" class="text-button" type="button">Cerrar sesión</button>
        <div class="form-message" id="logout-message" role="status" aria-live="polite"></div>
    `;
    document.getElementById('logout-button').addEventListener('click', async event => {
        const button = event.currentTarget;
        const message = document.getElementById('logout-message');
        button.disabled = true;
        set_message(message, 'Cerrando sesión…');
        try {
            await request_json('/api/auth/logout', { method: 'POST' });
            window.location.assign('/cuenta.html');
        } catch (error) {
            set_message(message, error.message, 'error');
            button.disabled = false;
        }
    });
}

function render_account_error() {
    const container = document.getElementById('account-view');
    container.innerHTML = '<p class="eyebrow">CONEXIÓN</p><h2>No pudimos comprobar tu sesión</h2><p class="account-lead">Podés volver a intentarlo. No se modificó ningún dato de tu cuenta.</p><button id="retry-account" class="button button-dark account-submit" type="button">Reintentar</button>';
    document.getElementById('retry-account').addEventListener('click', init_account);
}

async function init_account() {
    try {
        const data = await request_json('/api/auth/me');
        if (data.user) render_logged_user(data.user);
        else {
            const params = new URLSearchParams(window.location.search);
            const google = await request_json('/api/auth/google/config').catch(() => ({ enabled: false }));
            const render = google.enabled ? render_account_forms : render_legacy_forms;
            render(params.has('auth_error') ? 'El ingreso fue cancelado o no pudo completarse. Volvé a intentarlo.' : params.has('admin') ? 'Ingresá con una cuenta administradora para continuar.' : '');
        }
    } catch {
        render_account_error();
    }
}

document.addEventListener('DOMContentLoaded', init_account);
