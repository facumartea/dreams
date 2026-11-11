const legacy_origin = 'https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev';
async function limited_body(request) {
    const reader = request.clone().body?.getReader();
    if (!reader) return null;
    const chunks = []; let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            length += value.byteLength;
            if (length > 32768) { void reader.cancel().catch(() => {}); return null; }
            chunks.push(value);
        }
        const bytes = new Uint8Array(length); let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch { return null; }
    finally { reader.releaseLock(); }
}
// Only select the verifier here. The immutable backend verifies signature, owner and expiry.
export async function legacy_presentation(request, fetcher = fetch) {
    const path = new URL(request.url).pathname;
    if (request.method !== 'POST' || !['/api/presentation/payment', '/api/presentation/result'].includes(path)) return null;
    const body = await limited_body(request), key = path.endsWith('/payment') ? 'ticket' : 'receipt';
    if (!body || Object.keys(body).length !== 1 || typeof body[key] !== 'string' || body[key].length > 24000) return null;
    try {
        const parts = body[key].split('.');
        if (parts.length !== 2) return null;
        const payload = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.version !== 2 || Object.hasOwn(payload, 'issuer')) return null;
        return fetcher(new Request(new URL(path, legacy_origin), new Request(request, { redirect: 'manual' })));
    } catch { return null; }
}
