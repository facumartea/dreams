// registra clientes mediante supabase auth y crea su perfil sin aceptar roles del navegador.
const { session: guardar_cookies_de_sesion } = require('./auth-cookies');

function leer_campos_de_registro(body = {}) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const forbidden = ['role', 'is_admin', 'app_metadata', 'user_metadata'];
    if (forbidden.some(key => Object.hasOwn(body, key))) return null;
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
    return password.length >= 8 && password.length <= 128 ? { name, email, password } : null;
}

async function guardar_perfil_del_cliente(database, user, values) {
    // nunca aceptar roles del formulario ni reemplazar perfiles existentes.
    const result = await database.from('profiles').upsert({ id: user.id, name: values.name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true });
    if (result.error) throw result.error;
}

function preparar_respuesta_del_registro(respuesta, data, values, production, demo = false, confirmation_required = true) {
    if (!data?.session) return respuesta.status(202).json({
        message: confirmation_required ? 'No hay una sesión activa. Si recibiste un correo de confirmación, abrilo antes de ingresar.' : 'No hay una sesión activa. Probá ingresar; si no podés, contactanos.',
        authenticated: false, requires_email_confirmation: confirmation_required
    });
    guardar_cookies_de_sesion(respuesta, data.session, production);
    return respuesta.status(demo ? 201 : 200).json({
        message: 'Cuenta creada correctamente. Ya ingresaste a DREAMS.', authenticated: true,
        ...(demo ? { demo: true } : {}),
        user: { id: data.user.id, name: values.name, email: values.email, is_admin: false }
    });
}

// usa el registro normal del proveedor; no confirma usuarios con privilegios de administrador.
async function registrar_cliente(context, values, respuesta) {
    // signup entrega la sesion cuando confirm email esta desactivado en supabase.
    const result = await context.create_auth_client().auth.signUp({
        email: values.email, password: values.password, options: { data: { name: values.name } }
    });
    if (result.error || !result.data?.user) return informar_fallo_de_registro(respuesta, result.error);
    await guardar_perfil_del_cliente(context.database, result.data.user, values);
    const confirmation_required = result.data.session ? false : await comprobar_confirmacion_del_registro(context);
    return preparar_respuesta_del_registro(respuesta, result.data, values, context.production, false, confirmation_required);
}

async function registrar_cuenta_del_modo_anterior(context, values, respuesta) {
    // compatibilidad historica, desactivada en oficial y preview; no resuelve este cambio.
    const created = await context.database.auth.admin.createUser({
        email: values.email, password: values.password, email_confirm: true, user_metadata: { name: values.name }
    });
    if (created.error || !created.data?.user) return respuesta.status(400).json({ error: 'No se pudo crear la cuenta con esos datos.' });
    await guardar_perfil_del_cliente(context.database, created.data.user, values);
    const signed = await context.create_auth_client().auth.signInWithPassword({ email: values.email, password: values.password });
    if (signed.error || !signed.data?.session || !signed.data?.user) {
        return respuesta.status(503).json({ error: 'La cuenta se creó, pero no pudimos iniciar la sesión. Probá ingresar nuevamente.' });
    }
    return preparar_respuesta_del_registro(respuesta, signed.data, values, context.production, true);
}

function preparar_registro_del_cliente(context) {
    return async (solicitud, respuesta) => {
        const values = leer_campos_de_registro(solicitud.body);
        if (!values) return respuesta.status(400).json({ error: 'Completá un nombre, correo válido y una contraseña de 8 a 128 caracteres. No se admiten roles en el registro.' });
        const register = context.demo_auto_confirm_email ? registrar_cuenta_del_modo_anterior : registrar_cliente;
        try { return await register(context, values, respuesta); }
        catch {
            return respuesta.status(503).json({ error: 'No pudimos completar el registro. Si ya creaste la cuenta, probá ingresar; de lo contrario, reintentá más tarde.' });
        }
    };
}

module.exports = { customer_registration: preparar_registro_del_cliente };


function informar_fallo_de_registro(respuesta, error) {
    if (error?.code === 'weak_password') return respuesta.status(400).json({ error: 'Elegí una contraseña que cumpla los requisitos de seguridad.', field: 'password' });
    if (error?.status >= 500 || error?.name === 'AuthRetryableFetchError') return respuesta.status(503).json({ error: 'El registro no está disponible temporalmente. Reintentá más tarde.' });
    return respuesta.status(400).json({ error: 'No se pudo completar el registro con esos datos. Probá ingresar o contactanos.' });
}

async function comprobar_confirmacion_del_registro(context) {
    try { return context.email_confirmation_required ? await context.email_confirmation_required() : true; }
    catch { return true; }
}
