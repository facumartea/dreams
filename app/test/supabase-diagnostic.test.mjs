import test from 'node:test';
import assert from 'node:assert/strict';
import { credential_shape, diagnose_supabase, scheduled_diagnostic } from '../worker/supabase-diagnostic.mjs';
import { create_official_database, official_project_url } from '../worker/official-client.mjs';
const fixture = 'sb_secret_LOCAL_FIXTURE_NEVER_A_REAL_CREDENTIAL_12345';
const env = { SUPABASE_URL: official_project_url, SUPABASE_SECRET_KEY: fixture };
test('shape reports whitespace/quotes/assignment without returning credential material', () => {
    for (const key of [fixture, ' '+fixture+' ', '"'+fixture+'"', 'SUPABASE_SECRET_KEY='+fixture]) {
        const report = credential_shape(key);
        assert.equal(report.present, true); assert.equal(report.characters, key.length); assert.ok(!JSON.stringify(report).includes(fixture));
    }
    assert.equal(credential_shape(' '+fixture+' ').surrounding_whitespace, true);
    assert.equal(credential_shape('"'+fixture+'"').wrapped_quotes, true);
    assert.equal(credential_shape('SUPABASE_SECRET_KEY='+fixture).assignment_instead_of_value, true);
});
test('candidate SDK passes API key unchanged and preserves the limited user JWT independently', async () => {
    for (const access of [null, 'user-jwt-fixture']) {
        let observed;
        const client = create_official_database(env, access, async (input, init) => { observed = { url: new URL(input), headers: new Headers(init.headers) }; return Response.json([]); });
        await client.from('products').select('id', { head: true }).limit(1);
        assert.equal(observed.url.origin, official_project_url); assert.equal(observed.headers.get('apikey'), fixture);
        assert.equal(observed.headers.get('Authorization'), 'Bearer '+(access || fixture));
    }
});
test('diagnostic performs only bounded minimal reads and returns no authentication headers or key', async () => {
    const requests = [];
    const result = await diagnose_supabase(env, async (input, init) => {
        const url = new URL(input); requests.push({ url, init }); assert.equal(init.method, 'HEAD'); assert.equal(url.pathname, '/rest/v1/products'); assert.equal(url.searchParams.get('select'), 'id'); assert.equal(url.searchParams.get('limit'), '1');
        return new Response(null, { status: 200 });
    });
    assert.equal(requests.length, 2); assert.equal(result.project_key_pair, 'verified_by_read'); assert.equal(result.candidate_sdk.apikey_unchanged, true);
    assert.ok(!JSON.stringify(result).includes(fixture)); assert.ok(!JSON.stringify(result).includes('Authorization'));
});
test('diagnostic distinguishes provider refusal from SDK compatibility, and never contacts a mismatched project', async () => {
    const failed = await diagnose_supabase(env, async () => new Response(null, { status: 401, headers: { 'sb-error-code': 'UNAUTHORIZED_INVALID_API_KEY' } }));
    assert.equal(failed.raw_apikey_only.invalid_api_key, true); assert.equal(failed.candidate_sdk.status, 401); assert.equal(failed.project_key_pair, 'not_verified');
    const skipped = await diagnose_supabase({ ...env, SUPABASE_URL: 'https://other.invalid' }, () => { throw new Error('must not run'); }); assert.equal(skipped.skipped, true);
    await scheduled_diagnostic(env); await scheduled_diagnostic({ ...env, DIAGNOSTIC_RUN_ID: 'expired', DIAGNOSTIC_EXPIRES_AT: '1' });
});
test('quote/whitespace probes diagnose a repair without changing the stored binding', async () => {
    const supplied = ' "'+fixture+'" ';
    const result = await diagnose_supabase({ ...env, SUPABASE_SECRET_KEY: supplied }, async (_url, init) => new Response(null, { status: new Headers(init.headers).get('apikey') === fixture ? 200 : 401 }));
    assert.equal(result.shape.surrounding_whitespace, true); assert.equal(result.shape.wrapped_quotes, true);
    assert.equal(result.raw_apikey_only.status, 401); assert.equal(result.trimmed_probe.status, 401); assert.equal(result.unquoted_probe.status, 200);
    assert.equal(result.project_key_pair, 'not_verified'); assert.ok(!JSON.stringify(result).includes(fixture));
});
test('decoded legacy claims are only format evidence, not proof of authentication or project pairing', async () => {
    const token = payload => 'e30.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.fixture-signature';
    assert.equal(credential_shape(token({ ref: 'nwsmbemwtexmrtpkgxrz', role: 'service_role' })).jwt_project, 'expected_service_role_claims');
    assert.equal(credential_shape(token({ ref: 'other', role: 'service_role' })).jwt_project, 'different_or_missing_claims');
    const report = await diagnose_supabase({ ...env, SUPABASE_SECRET_KEY: token({ ref: 'nwsmbemwtexmrtpkgxrz', role: 'service_role' }) }, async () => new Response(null, { status: 401 }));
    assert.equal(report.project_key_pair, 'not_verified');
});

test('diagnóstico distingue caracteres de control y validez de header sin reconstruir la clave', () => {
    const source = fixture.slice(0, 20) + '\n' + fixture.slice(20);
    const report = credential_shape(source);
    assert.equal(report.ascii_controls, true);
    assert.equal(report.internal_whitespace, true);
    assert.equal(report.header_value_valid, false);
    assert.equal(credential_shape(fixture).header_value_valid, true);
    assert.equal(credential_shape(fixture).ascii_controls, false);
    assert.ok(!JSON.stringify(report).includes(source));
});
