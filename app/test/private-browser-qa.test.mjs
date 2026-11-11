import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare_browser_qa, encrypt_browser_session } from '../worker/private-browser-qa.mjs';
const origin = 'https://dreams-perfumes.pages.dev';
const project = 'https://nwsmbemwtexmrtpkgxrz.supabase.co';
const env = () => ({ SUPABASE_URL: project, APP_BASE_URL: origin, APP_ORIGINS: origin, QA_RUN_ID: 'pr56-browser-fixture', QA_EXPIRES_AT: String(Date.now() + 600000), QA_BROWSER_PUBLIC_KEY: 'fixture', DREAMS_QA_ADMIN_PASSWORD: 'fixture-password', QA_BROWSER_VAULT: { get: () => assert.fail(), put: () => assert.fail() } });

test('sesión sólo cifrada se puede recuperar con la clave privada efímera; otra clave no sirve', async () => {
    const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    const public_key = Buffer.from(await crypto.subtle.exportKey('spki', pair.publicKey)).toString('base64');
    const payload = { cookies: ['fixture-access-secret', 'fixture-refresh-secret'] };
    const encrypted = await encrypt_browser_session(public_key, payload);
    assert.ok(!JSON.stringify(encrypted).includes('fixture-access-secret'));
    assert.ok(!JSON.stringify(encrypted).includes('fixture-refresh-secret'));
    const raw = await crypto.subtle.decrypt('RSA-OAEP', pair.privateKey, Buffer.from(encrypted.wrapped_key, 'base64'));
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(encrypted.iv, 'base64') }, key, Buffer.from(encrypted.ciphertext, 'base64'));
    assert.deepEqual(JSON.parse(new TextDecoder().decode(plaintext)), payload);
    const other = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    await assert.rejects(crypto.subtle.decrypt('RSA-OAEP', other.privateKey, Buffer.from(encrypted.wrapped_key, 'base64')));
});

test('sin opt-in, proyecto correcto o vencimiento válido no lee vault ni credenciales', async () => {
    const no_network = { create_database: () => assert.fail(), fetch: () => assert.fail() };
    for (const override of [{ QA_BROWSER_PUBLIC_KEY: '' }, { SUPABASE_URL: 'https://other.invalid' }, { APP_ORIGINS: '*' }, { QA_EXPIRES_AT: '1' }, { QA_EXPIRES_AT: String(Date.now() + 3600000) }, { QA_RUN_ID: 'invalid' }]) {
        assert.equal(await prepare_browser_qa({ ...env(), ...override }, no_network), false);
    }
});

test('un grant existente no produce otra sesión ni sobrescribe almacenamiento', async () => {
    const configured = env(); configured.QA_BROWSER_VAULT.get = async () => 'encrypted-existing';
    assert.equal(await prepare_browser_qa(configured, { create_database: () => assert.fail(), fetch: () => assert.fail() }), false);
});

test('identidad distinta no puede iniciar sesión ni persistir un grant', async () => {
    const configured = env(); configured.QA_BROWSER_VAULT.get = async () => null;
    await assert.rejects(prepare_browser_qa(configured, {
        create_database: () => ({ auth: { admin: { getUserById: async () => ({ data: { user: { id: 'other', email: 'fixture@example.com' } } }) } } }),
        fetch: () => assert.fail()
    }), /admin_identity/);
});

async function session_fixture() {
    const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    const configured = env(); configured.QA_BROWSER_PUBLIC_KEY = Buffer.from(await crypto.subtle.exportKey('spki', pair.publicKey)).toString('base64');
    configured.QA_BROWSER_VAULT.get = async () => null;
    const admin = 'a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19';
    let logouts = 0;
    const services = { create_database: () => ({ auth: { admin: { getUserById: async () => ({ data: { user: { id: admin, email: 'qa-fixture@example.com' } } }) } } }),
        fetch: async (url, init) => {
            if (url.endsWith('/logout')) { logouts++; return Response.json({}); }
            assert.equal(init.headers['Content-Length'], String(new TextEncoder().encode(init.body).length));
            const headers = new Headers();
            for (const name of ['dreams_access_token', 'dreams_refresh_token']) headers.append('Set-Cookie', `${name}=fixture-private-cookie; HttpOnly; Secure; SameSite=Lax`);
            return Response.json({ user: { id: admin, is_admin: true } }, { headers });
        } };
    return { configured, services, logouts: () => logouts };
}
test('grant válido almacena únicamente el sobre cifrado y TTL, nunca contraseña o cookies', async () => {
    const fixture = await session_fixture(); let stored;
    fixture.configured.QA_BROWSER_VAULT.put = async (key, data, options) => { stored = { key, data, options }; };
    assert.equal(await prepare_browser_qa(fixture.configured, fixture.services), true);
    assert.equal(stored.options.expirationTtl, 1800);
    assert.ok(!stored.data.includes('fixture-private-cookie'));
    assert.ok(!stored.data.includes(fixture.configured.DREAMS_QA_ADMIN_PASSWORD));
    assert.equal(JSON.parse(stored.data).version, 1);
});
test('fallo de vault cierra la sesión antes de informar error sanitizado', async () => {
    const fixture = await session_fixture(); fixture.configured.QA_BROWSER_VAULT.put = async () => { throw Error('provider-private-detail'); };
    await assert.rejects(prepare_browser_qa(fixture.configured, fixture.services), /^Error: private_encryption_or_vault$/);
    assert.equal(fixture.logouts(), 1);
});
test('fallo de cifrado también revoca la sesión aún no transferida', async () => {
    const fixture = await session_fixture(); fixture.configured.QA_BROWSER_PUBLIC_KEY = 'invalid';
    await assert.rejects(prepare_browser_qa(fixture.configured, fixture.services), /private_encryption_or_vault/);
    assert.equal(fixture.logouts(), 1);
});
