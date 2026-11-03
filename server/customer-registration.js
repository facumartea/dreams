const { session } = require('./auth-cookies');

function registration_values(body = {}) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const forbidden = ['role', 'is_admin', 'app_metadata', 'user_metadata'];
    if (forbidden.some(key => Object.hasOwn(body, key))) return null;
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
    return password.length >= 8 && password.length <= 128 ? { name, email, password } : null;
}

async function save_customer(database, user, values) {
    // Nunca aceptar roles del formulario ni reemplazar perfiles existentes.
    const result = await database.from('profiles').upsert({ id: user.id, name: values.name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true });
    if (result.error) throw result.error;
}

function registered_response(response, data, values, production, demo = false, confirmation_required = true) {
    if (!data?.session) return response.status(202).json({
        message: confirmation_required ? 'No hay una sesión activa. Si recibiste un correo de confirmación, abrilo antes de ingresar.' : 'No hay una sesión activa. Probá ingresar; si no podés, contactanos.',
        authenticated: false, requires_email_confirmation: confirmation_required
    });
    session(response, data.session, production);
    return response.status(demo ? 201 : 200).json({
        message: 'Cuenta creada correctamente. Ya ingresaste a DREAMS.', authenticated: true,
        ...(demo ? { demo: true } : {}),
        user: { id: data.user.id, name: values.name, email: values.email, is_admin: false }
    });
}

async function normal_registration(context, values, response) {
    // signUp entrega la sesión cuando Confirm email está desactivado en Supabase.
    const result = await context.create_auth_client().auth.signUp({
        email: values.email, password: values.password, options: { data: { name: values.name } }
    });
    if (result.error || !result.data?.user) return registration_failure(response, result.error);
    await save_customer(context.database, result.data.user, values);
    const confirmation_required = result.data.session ? false : await registration_confirmation(context);
    return registered_response(response, result.data, values, context.production, false, confirmation_required);
}

async function legacy_demo_registration(context, values, response) {
    // Compatibilidad histórica, desactivada en oficial y preview; no resuelve este cambio.
    const created = await context.database.auth.admin.createUser({
        email: values.email, password: values.password, email_confirm: true, user_metadata: { name: values.name }
    });
    if (created.error || !created.data?.user) return response.status(400).json({ error: 'No se pudo crear la cuenta con esos datos.' });
    await save_customer(context.database, created.data.user, values);
    const signed = await context.create_auth_client().auth.signInWithPassword({ email: values.email, password: values.password });
    if (signed.error || !signed.data?.session || !signed.data?.user) {
        return response.status(503).json({ error: 'La cuenta se creó, pero no pudimos iniciar la sesión. Probá ingresar nuevamente.' });
    }
    return registered_response(response, signed.data, values, context.production, true);
}

function customer_registration(context) {
    return async (request, response) => {
        const values = registration_values(request.body);
        if (!values) return response.status(400).json({ error: 'Completá un nombre, correo válido y una contraseña de 8 a 128 caracteres. No se admiten roles en el registro.' });
        const register = context.demo_auto_confirm_email ? legacy_demo_registration : normal_registration;
        try { return await register(context, values, response); }
        catch {
            return response.status(503).json({ error: 'No pudimos completar el registro. Si ya creaste la cuenta, probá ingresar; de lo contrario, reintentá más tarde.' });
        }
    };
}

module.exports = { customer_registration };


function registration_failure(response, error) {
    if (error?.code === 'weak_password') return response.status(400).json({ error: 'Elegí una contraseña que cumpla los requisitos de seguridad.', field: 'password' });
    if (error?.status >= 500 || error?.name === 'AuthRetryableFetchError') return response.status(503).json({ error: 'El registro no está disponible temporalmente. Reintentá más tarde.' });
    return response.status(400).json({ error: 'No se pudo completar el registro con esos datos. Probá ingresar o contactanos.' });
}

async function registration_confirmation(context) {
    try { return context.email_confirmation_required ? await context.email_confirmation_required() : true; }
    catch { return true; }
}
