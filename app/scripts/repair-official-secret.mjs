import { pathToFileURL } from 'node:url';
const project = 'nwsmbemwtexmrtpkgxrz';
const account = '9f3d7af60fcb0c2b4fff8570843588f9';
const worker = 'dreams-official-backend';
const key_name = 'dreams_official_backend';
class RepairError extends Error {
    constructor(code, status) { super(code); this.status = status; }
}
async function request(fetcher, url, token, method = 'GET', body) {
    const response = await fetcher(url, { method, redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new RepairError('management_request_failed', response.status);
    return response.json();
}
async function cloudflare_request(fetcher, token, suffix, method, body) {
    const result = await request(fetcher, `https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${worker}/${suffix}`, token, method, body);
    if (!result.success) throw new RepairError('cloudflare_rejected_operation');
    return result.result;
}
async function dedicated_key(fetcher, token) {
    const base = `https://api.supabase.com/v1/projects/${project}/api-keys`;
    const keys = await request(fetcher, base + '?reveal=false', token);
    if (!Array.isArray(keys)) throw new RepairError('unexpected_key_metadata');
    const existing = keys.find(key => key.name === key_name && key.type === 'secret');
    if (existing && !/^[a-f0-9-]{36}$/i.test(existing.id || '')) throw new RepairError('unexpected_key_identifier');
    return existing
        ? request(fetcher, `${base}/${existing.id}?reveal=true`, token)
        : request(fetcher, base + '?reveal=true', token, 'POST', { name: key_name, type: 'secret', description: 'Private backend for the authorized DREAMS official site' });
}
async function verify_key(fetcher, key) {
    if (key.type !== 'secret' || !/^sb_secret_[A-Za-z0-9_-]+$/.test(key.api_key || '')) throw new RepairError('invalid_server_key_format');
    const response = await fetcher(`https://${project}.supabase.co/rest/v1/products?select=id&limit=1`, {
        method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(8000), headers: { apikey: key.api_key }
    });
    await response.body?.cancel();
    if (response.status !== 200) throw new RepairError('source_key_read_failed', response.status);
}
export async function repair_official_secret(env, fetcher = fetch, apply = false) {
    if (!env.SUPABASE_ACCESS_TOKEN || !env.CLOUDFLARE_API_TOKEN) throw new RepairError('missing_secure_management_credentials');
    if (!apply) return { mode: 'not_applied', credentials_present: true };
    const before = await cloudflare_request(fetcher, env.CLOUDFLARE_API_TOKEN, 'deployments');
    const previous_version = before?.deployments?.[0]?.versions?.[0]?.version_id;
    if (!previous_version) throw new RepairError('missing_candidate_version');
    const key = await dedicated_key(fetcher, env.SUPABASE_ACCESS_TOKEN);
    await verify_key(fetcher, key);
    await cloudflare_request(fetcher, env.CLOUDFLARE_API_TOKEN, 'secrets', 'PUT', { name: 'SUPABASE_SECRET_KEY', type: 'secret_text', text: key.api_key });
    const after = await cloudflare_request(fetcher, env.CLOUDFLARE_API_TOKEN, 'deployments');
    return { secret_updated: true, service: worker, environment: 'Production/default', previous_version,
        current_version: after?.deployments?.[0]?.versions?.[0]?.version_id, source_read: 200,
        candidate_read_verified: false, official_deployed: false };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try { console.log(JSON.stringify(await repair_official_secret(process.env, fetch, process.argv.includes('--apply')))); }
    catch (error) { console.error(JSON.stringify({ secret_updated: false, error: error instanceof RepairError ? error.message : 'request_failed', ...(error instanceof RepairError && error.status ? { status: error.status } : {}) })); process.exitCode = 1; }
}
