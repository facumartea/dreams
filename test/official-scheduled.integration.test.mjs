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
