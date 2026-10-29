import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestHarness } from 'wrangler';
import { readFile } from 'node:fs/promises';

test('backend oficial conserva HTTP y no ejecuta QA/diagnóstico sin opt-in en scheduled', { timeout: 60000 }, async t => {
    const config = JSON.parse(await readFile(new URL('../wrangler.official.jsonc', import.meta.url), 'utf8'));
    // Sólo el runtime local está limitado a esta fecha; producción conserva27/10.
    config.compatibility_date = '2026-10-08';
    config.main = new URL('../worker/official.mjs', import.meta.url).pathname;
    config.vars.SUPABASE_SECRET_KEY = 'sb_secret_OFFICIAL_LOCAL_FIXTURE_ONLY';
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
