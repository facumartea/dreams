// entradas reales en workerd y retirada de mecanismos temporales.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestHarness } from 'wrangler';
import { readFile } from 'node:fs/promises';

test('backend oficial conserva HTTP y retira QA/diagnóstico incluso con variables antiguas', { timeout: 60000 }, async t => {
    const config = JSON.parse(await readFile(new URL('../wrangler.official.jsonc', import.meta.url), 'utf8'));
    // solo el runtime local esta limitado a esta fecha; produccion conserva27/10.
    config.compatibility_date = '2026-10-08';
    config.main = new URL('../worker/official.mjs', import.meta.url).pathname;
    config.vars.SUPABASE_SECRET_KEY = 'sb_secret_OFFICIAL_LOCAL_FIXTURE_ONLY';
    config.vars.QA_RUN_ID = 'retired-fixture';
    config.vars.QA_EXPIRES_AT = String(Date.now() + 60000);
    config.vars.DREAMS_QA_ADMIN_PASSWORD = 'retired-local-fixture';
    const production_source = await readFile(config.main, 'utf8');
    assert.doesNotMatch(production_source, /official-qa|private-browser-qa|supabase-diagnostic|QA_RUN_ID|DREAMS_QA_ADMIN_PASSWORD/);
    const harness = createTestHarness({ workers: [{ config }] });
    t.after(() => harness.close());
    await harness.listen();
    const worker = harness.getWorker();
    await worker.scheduled({ cron: '* * * * *', scheduledTime: new Date() });
    const logs = JSON.stringify(harness.getLogs());
    assert.doesNotMatch(logs, /DREAMS private QA|DREAMS credential diagnostic/);
    const me = await worker.fetch('https://dreams-perfumes.pages.dev/api/auth/me');
    assert.equal(me.status, 200);
    assert.deepEqual(await me.json(), { user: null });
    const forbidden = await worker.fetch('https://other.invalid/api/auth/me');
    assert.equal(forbidden.status, 403);
    const private_route = await worker.fetch('https://dreams-perfumes.pages.dev/api/internal-qa');
    assert.equal(private_route.status, 403);
});

test('invocación HTTP sintética necesita Content-Length para que Express lea JSON, sin consultar Supabase real', { timeout: 60000 }, async t => {
    const config = JSON.parse(await readFile(new URL('../wrangler.official.jsonc', import.meta.url), 'utf8'));
    config.compatibility_date = '2026-10-08';
    config.main = new URL('../worker/test-fixtures/synthetic-registration.mjs', import.meta.url).pathname;
    config.vars.SUPABASE_SECRET_KEY = 'sb_secret_SYNTHETIC_FIXTURE_ONLY';
    const harness = createTestHarness({ workers: [{ config }] });
    t.after(() => harness.close());
    await harness.listen();
    const missing = await harness.fetch('https://fixture.invalid/');
    const rejected = await missing.json();
    assert.equal(rejected.status, 400);
    assert.equal(rejected.input_rejected, true);
    assert.equal(rejected.auth_calls, 0);
    const sized = await harness.fetch('https://fixture.invalid/?length=1');
    const accepted = await sized.json();
    assert.equal(accepted.status, 200);
    assert.equal(accepted.auth_calls, 1);
    assert.equal(accepted.profile_writes, 1);
    assert.equal(accepted.authenticated, true);
    assert.equal(accepted.cookie_count, 2);
});

test('grant Admin recorre login normal en workerd y cifra sesión sin Supabase real', { timeout: 60000 }, async t => {
    const pair = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 3072, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    const config = JSON.parse(await readFile(new URL('../wrangler.official.jsonc', import.meta.url), 'utf8'));
    config.compatibility_date = '2026-10-08';
    config.main = new URL('../worker/test-fixtures/private-browser-session.mjs', import.meta.url).pathname;
    config.vars.SUPABASE_SECRET_KEY = 'sb_secret_LOCAL_GRANT_FIXTURE_ONLY';
    config.vars.DREAMS_QA_ADMIN_PASSWORD = 'fixture-admin-password';
    config.vars.QA_BROWSER_PUBLIC_KEY = Buffer.from(await crypto.subtle.exportKey('spki', pair.publicKey)).toString('base64');
    const harness = createTestHarness({ workers: [{ config }] });
    t.after(() => harness.close()); await harness.listen();
    const response = await harness.fetch('https://fixture.invalid/');
    assert.deepEqual(await response.json(), { ready: true, encrypted: true, auth_calls: 1 });
});

test('workerd rechaza stock null antes de escribir y acredita versión sin exponer autenticación', { timeout: 60000 }, async t => {
    const config = JSON.parse(await readFile(new URL('../wrangler.official.jsonc', import.meta.url), 'utf8'));
    config.compatibility_date = '2026-10-08';
    config.main = new URL('../worker/test-fixtures/private-browser-session.mjs', import.meta.url).pathname;
    config.vars.SUPABASE_SECRET_KEY = 'sb_secret_LOCAL_TYPE_FIXTURE_ONLY';
    config.vars.CF_VERSION_METADATA = { id: '11111111-1111-4111-8111-111111111111' };
    const harness = createTestHarness({ workers: [{ config }] });
    t.after(() => harness.close()); await harness.listen();
    const response = await harness.fetch('https://fixture.invalid/?types=1');
    assert.deepEqual(await response.json(), { status: 400, product_writes: 0, backend_version: config.vars.CF_VERSION_METADATA.id });
});
