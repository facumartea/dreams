import test from 'node:test';
import assert from 'node:assert/strict';
import { repair_official_secret } from '../scripts/repair-official-secret.mjs';
const env = { SUPABASE_ACCESS_TOKEN: 'fixture-management', CLOUDFLARE_API_TOKEN: 'fixture-cloudflare' };
const key = { id: '11111111-1111-4111-8111-111111111111', name: 'dreams_official_backend', type: 'secret', api_key: 'sb_secret_LOCAL_FIXTURE_ONLY_1234567890' };
function fixture({ existing = true, read_status = 200 } = {}) {
    const calls = []; let updated = false;
    return { calls, fetch: async (input, init) => {
        const url = new URL(input); calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null });
        assert.ok(!['DELETE', 'PATCH'].includes(init.method));
        if (url.hostname === 'api.supabase.com') { assert.match(url.pathname, /^\/v1\/projects\/nwsmbemwtexmrtpkgxrz\/api-keys/); return Response.json(url.search === '?reveal=false' ? (existing ? [{ ...key, api_key: null }] : []) : key); }
        if (url.hostname === 'nwsmbemwtexmrtpkgxrz.supabase.co') { assert.equal(init.method, 'HEAD'); return new Response(null, { status: read_status }); }
        assert.equal(url.hostname, 'api.cloudflare.com'); assert.match(url.pathname, /\/workers\/scripts\/dreams-official-backend\//);
        if (url.pathname.endsWith('/secrets')) { updated = true; assert.equal(calls.at(-1).body.text, key.api_key); return Response.json({ success: true, result: { name: 'SUPABASE_SECRET_KEY', type: 'secret_text' } }); }
        return Response.json({ success: true, result: { deployments: [{ versions: [{ version_id: updated ? 'new-fixture-version' : 'old-fixture-version' }] }] } });
    } };
}
test('repair requires secure management credentials and explicit apply before any external action', async () => {
    let calls = 0; const fetcher = () => { calls++; throw new Error('must not run'); };
    await assert.rejects(repair_official_secret({}, fetcher, true), /missing_secure_management_credentials/);
    assert.equal((await repair_official_secret(env, fetcher)).mode, 'not_applied'); assert.equal(calls, 0);
});
test('repair transfers an existing dedicated server key only to the private Worker, without returning credentials', async () => {
    const f = fixture(), result = await repair_official_secret(env, f.fetch, true);
    assert.equal(result.secret_updated, true); assert.equal(result.source_read, 200); assert.equal(result.candidate_read_verified, false); assert.equal(result.official_deployed, false);
    assert.ok(!JSON.stringify(result).includes(key.api_key)); assert.ok(!JSON.stringify(result).includes(env.SUPABASE_ACCESS_TOKEN));
    assert.equal(f.calls.filter(call => call.method === 'PUT').length, 1); assert.equal(f.calls.some(call => call.url.pathname.includes('/pages/')), false);
});
test('a rejected source key prevents modification of the private Secret', async () => {
    const f = fixture({ read_status: 401 }); await assert.rejects(repair_official_secret(env, f.fetch, true), /source_key_read_failed/);
    assert.equal(f.calls.some(call => call.method === 'PUT'), false);
});
test('a missing dedicated key is created additively, never replacing or revoking existing Supabase keys', async () => {
    const f = fixture({ existing: false }); await repair_official_secret(env, f.fetch, true);
    const creation = f.calls.filter(call => call.method === 'POST'); assert.equal(creation.length, 1); assert.equal(creation[0].body.type, 'secret'); assert.equal(creation[0].body.name, 'dreams_official_backend');
});
test('a malformed revealed key is rejected without removing whitespace or writing the Worker Secret', async () => {
    const f = fixture(); const fetcher = (input, init) => String(input).endsWith('?reveal=true') ? Response.json({ ...key, api_key: 'sb_secret_invalid value' }) : f.fetch(input, init);
    await assert.rejects(repair_official_secret(env, fetcher, true), /invalid_server_key_format/);
    assert.equal(f.calls.some(call => call.method === 'PUT'), false);
});
