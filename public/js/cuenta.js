async function get_current_user() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.user;
}

function render_account_forms() {
    const container = document.getElementById('account-view');
    container.innerHTML = `
        <p class="eyebrow">DREAMS ACCOUNT</p>
        <h1>Tu cuenta</h1>
        <div class="account-tabs">
            <button id="login-tab" class="active">Iniciar sesión</button>
            <button id="register-tab">Registrarme</button>
        </div>
        <form id="login-form">
            <div class="form-field"><label for="login-email">Correo</label><input id="login-email" type="email" required></div>
            <div class="form-field"><label for="login-password">Contraseña</label><input id="login-password" type="password" required></div>
            <div class="form-message" id="login-message"></div>
            <button class="button button-dark" type="submit">Ingresar</button>
        </form>
        <form id="register-form" hidden>
            <div class="form-grid">
                <div class="form-field full"><label for="register-name">Nombre</label><input id="register-name" required></div>
                <div class="form-field full"><label for="register-email">Correo</label><input id="register-email" type="email" required></div>
                <div class="form-field"><label for="register-password">Contraseña</label><input id="register-password" type="password" required></div>
                <div class="form-field"><label for="register-confirm">Repetir contraseña</label><input id="register-confirm" type="password" required></div>
            </div>
            <div class="form-message" id="register-message"></div>
            <button class="button button-dark" type="submit">Crear cuenta</button>
        </form>
    `;

    document.getElementById('login-tab').addEventListener('click', () => switch_account_form('login'));
    document.getElementById('register-tab').addEventListener('click', () => switch_account_form('register'));
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('register-form').addEventListener('submit', register);
}

function switch_account_form(mode) {
    const login_tab = document.getElementById('login-tab');
    const register_tab = document.getElementById('register-tab');
    const login_form = document.getElementById('login-form');
    const register_form = document.getElementById('register-form');

    login_tab.classList.toggle('active', mode === 'login');
    register_tab.classList.toggle('active', mode === 'register');
    login_form.hidden = mode !== 'login';
    register_form.hidden = mode !== 'register';
}

async function login(event) {
    event.preventDefault();
    const message = document.getElementById('login-message');
    const body = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    };

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    message.textContent = data.error || data.message;

    if (response.ok) {
        setTimeout(() => window.location.reload(), 500);
    }
}

async function register(event) {
    event.preventDefault();
    const message = document.getElementById('register-message');
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        message.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    const body = {
        name: document.getElementById('register-name').value,
        email: document.getElementById('register-email').value,
        password
    };

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    message.textContent = data.error || data.message;

    if (response.ok) {
        setTimeout(() => window.location.reload(), 500);
    }
}

function render_logged_user(user) {
    const container = document.getElementById('account-view');
    container.innerHTML = `
        <p class="eyebrow">BIENVENIDO</p>
        <h1>${user.name}</h1>
        <p>Sesión iniciada con <strong>${user.email}</strong>.</p>
        <p>Guardá favoritos, consultá tus perfumes y mantené tu selección desde cualquier dispositivo de esta demo.</p>
        ${user.is_admin ? '<a class="admin-link" href="/admin">Entrar al panel de administrador</a>' : ''}
        <br><br>
        <button id="logout-button" class="button">Cerrar sesión</button>
    `;

    document.getElementById('logout-button').addEventListener('click', async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.reload();
    });
}

async function init_account() {
    const user = await get_current_user();
    if (user) {
        render_logged_user(user);
    } else {
        render_account_forms();
    }
}

document.addEventListener('DOMContentLoaded', init_account);
