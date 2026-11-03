import { create_official_database } from './official-client.mjs';
const origin = 'https://dreams-perfumes.pages.dev';
const project = 'https://nwsmbemwtexmrtpkgxrz.supabase.co';
const admin_id = 'a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19';
const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));

export async function encrypt_browser_session(public_key, session) {
    const recipient = await crypto.subtle.importKey('spki', decode(public_key), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(session)));
    const wrapped_key = await crypto.subtle.encrypt('RSA-OAEP', recipient, await crypto.subtle.exportKey('raw', key));
    return { version: 1, wrapped_key: encode(wrapped_key), iv: encode(iv), ciphertext: encode(ciphertext) };
}

async function normal_admin_session(env, services) {
    const db = (services.create_database || create_official_database)(env);
    const found = await db.auth.admin.getUserById(admin_id);
    if (found.error || found.data?.user?.id !== admin_id || !found.data.user.email) throw new Error('admin_identity');
    const response = await (services.fetch || fetch)(origin + '/api/auth/login', { method: 'POST', redirect: 'error',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: found.data.user.email, password: env.DREAMS_QA_ADMIN_PASSWORD }) });
    const data = await response.json();
    if (response.status !== 200 || data.user?.id !== admin_id || data.user?.is_admin !== true) throw new Error('admin_login');
    const cookies = response.headers.getSetCookie();
    if (cookies.length < 2 || !cookies.every(c => /; HttpOnly/i.test(c) && /; Secure/i.test(c))) throw new Error('secure_session');
    return { origin, run: env.QA_RUN_ID, expires_at: Number(env.QA_EXPIRES_AT), cookies };
}

// Sólo scheduled privado. Contraseña confinada al Worker; sesión cifrada para
// una clave pública efímera cuyo componente privado vive únicamente en RAM.
export async function prepare_browser_qa(env, services = {}) {
    const expires = Number(env.QA_EXPIRES_AT);
    if (!env.QA_BROWSER_PUBLIC_KEY || !env.QA_BROWSER_VAULT || !env.DREAMS_QA_ADMIN_PASSWORD) return false;
    if (env.SUPABASE_URL !== project || env.APP_BASE_URL !== origin || env.APP_ORIGINS !== origin) return false;
    if (!/^pr56-[a-z0-9-]{1,32}$/.test(env.QA_RUN_ID || '') || !Number.isFinite(expires) || expires <= Date.now() || expires - Date.now() > 1800000) return false;
    if (await env.QA_BROWSER_VAULT.get(env.QA_RUN_ID)) return false;
    const session = await normal_admin_session(env, services);
    const encrypted = await encrypt_browser_session(env.QA_BROWSER_PUBLIC_KEY, session);
    try { await env.QA_BROWSER_VAULT.put(env.QA_RUN_ID, JSON.stringify(encrypted), { expirationTtl: 1800 }); }
    catch { await close_untransferred_session(session, services); throw new Error('private_vault_unavailable'); }
    return true;
}

async function close_untransferred_session(session, services) {
    const cookies = session.cookies.map(cookie => cookie.split(';')[0]).join('; ');
    await (services.fetch || fetch)(origin + '/api/auth/logout', { method: 'POST', redirect: 'error', headers: { Origin: origin, Cookie: cookies } });
}
