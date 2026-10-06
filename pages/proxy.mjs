function unavailable() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

// Pages owns the public hostname; the existing Worker owns assets, auth and DB.
// Forward the original URL/Origin/body/cookies through a fixed Service binding.
export default {
    async fetch(request, env) {
        if (!env.DREAMS?.fetch) return unavailable();
        try {
            return await env.DREAMS.fetch(request);
        } catch {
            return unavailable();
        }
    }
};
