import { create_official_database, official_project_url } from './official-client.mjs';

function header_value_valid(value) {
    try { new Headers({ apikey: value }); return true; }
    catch { return false; }
}
export function credential_shape(value) {
    const key = typeof value === 'string' ? value : '';
    const trimmed = key.trim();
    const wrapped = trimmed.length > 1 && ((trimmed[0] === '"' && trimmed.at(-1) === '"') || (trimmed[0] === "'" && trimmed.at(-1) === "'"));
    return { present: Boolean(key), characters: key.length, bytes: new TextEncoder().encode(key).length,
        kind: key.startsWith('sb_secret_') ? 'modern_secret' : key.startsWith('sb_publishable_') ? 'publishable' : key.split('.').length === 3 ? 'jwt_candidate' : 'unrecognized',
        surrounding_whitespace: key !== key.trim(), any_whitespace: /\s/.test(key), wrapped_quotes: wrapped,
        ascii_controls: /[\x00-\x1f\x7f]/.test(key), internal_whitespace: /\s/.test(trimmed), header_value_valid: header_value_valid(key),
        assignment_instead_of_value: /^\s*[A-Z_][A-Z_0-9]*\s*=/.test(key),
        bearer_prefix_present: /^\s*Bearer\s/i.test(key), masked_or_ellipsis: /[•…]|\*{3,}/.test(key), non_ascii: /[^\x20-\x7e]/.test(key),
        jwt_project: jwt_project(key) };
}
function jwt_project(key) {
    try {
        const pieces = key.split('.');
        if (pieces.length !== 3) return 'not_encoded';
        const payload = JSON.parse(atob(pieces[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.ref === 'nwsmbemwtexmrtpkgxrz' && payload.role === 'service_role' ? 'expected_service_role_claims' : 'different_or_missing_claims';
    } catch { return 'malformed'; }
}
async function minimal_raw_read(env, key, fetcher) {
    try {
        const response = await fetcher(new URL('/rest/v1/products?select=id&limit=1', env.SUPABASE_URL), {
            method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { apikey: key, Accept: 'application/json' }
        });
        await response.body?.cancel();
        return { status: response.status, invalid_api_key: response.headers.get('sb-error-code') === 'UNAUTHORIZED_INVALID_API_KEY' };
    } catch { return { status: null, transport_failed: true }; }
}
async function minimal_sdk_read(env, fetcher) {
    const transport = { apikey_unchanged: null, bearer_is_api_key: null, bearer_is_user_token: false };
    try {
        const client = create_official_database(env, null, async (input, init) => {
            const headers = new Headers(init?.headers);
            transport.apikey_unchanged = headers.get('apikey') === env.SUPABASE_SECRET_KEY;
            transport.bearer_is_api_key = headers.get('Authorization') === `Bearer ${env.SUPABASE_SECRET_KEY}`;
            return fetcher(input, init);
        });
        const result = await client.from('products').select('id', { head: true }).limit(1).abortSignal(AbortSignal.timeout(8000));
        return { status: result.status, succeeded: !result.error && result.status === 200, ...transport };
    } catch { return { status: null, failed_before_response: true, ...transport }; }
}
export async function diagnose_supabase(env, fetcher = fetch) {
    const shape = credential_shape(env.SUPABASE_SECRET_KEY);
    const report = { diagnostic: 'pr56-supabase-binding-v1', run: env.DIAGNOSTIC_RUN_ID || 'local-fixture', binding: 'SUPABASE_SECRET_KEY', project_url_matches: env.SUPABASE_URL === official_project_url, shape };
    if (!report.project_url_matches || !shape.present) return { ...report, skipped: true };
    const raw = await minimal_raw_read(env, env.SUPABASE_SECRET_KEY, fetcher);
    const sdk = await minimal_sdk_read(env, fetcher);
    const normalized = String(env.SUPABASE_SECRET_KEY).trim();
    const trimmed = shape.surrounding_whitespace ? await minimal_raw_read(env, normalized, fetcher) : null;
    const unquoted = shape.wrapped_quotes ? await minimal_raw_read(env, normalized.slice(1, -1), fetcher) : null;
    return { ...report, raw_apikey_only: raw, candidate_sdk: sdk, trimmed_probe: trimmed, unquoted_probe: unquoted,
        project_key_pair: raw.status === 200 && sdk.succeeded ? 'verified_by_read' : 'not_verified' };
}
export async function scheduled_diagnostic(env) {
    const expires = Number(env.DIAGNOSTIC_EXPIRES_AT);
    if (!env.DIAGNOSTIC_RUN_ID || !Number.isFinite(expires) || Date.now() >= expires || expires - Date.now() > 3600000) return;
    console.log('DREAMS credential diagnostic', await diagnose_supabase(env));
}
