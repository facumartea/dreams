import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('building Pages from the video branch still serves the approved static release, never video preview content', async () => {
    execFileSync(process.execPath, ['scripts/build-pages.mjs'], { cwd: new URL('../', import.meta.url) });
    const module = await import('../dist/pages/_worker.js');
    const original = globalThis.fetch;
    try {
        globalThis.fetch = async request => {
            assert.equal(new URL(request.url).host, '40e7b0a3-dreams-perfumes.dreams-perfumes.workers.dev');
            return new Response('upstream', { headers: { 'Content-Security-Policy': "default-src 'self'" } });
        };
        const response = await module.default.fetch(new Request('https://dreams-perfumes.pages.dev/'), {});
        const html = await response.text();
        assert.equal(response.status, 200);
        assert.match(html, /dreams-hero-1024.webp/);
        assert.match(html, /Descubrir perfumes/);
        assert.doesNotMatch(html, /hero-video.js|hero-video-layout|\.mp4|<video/);
        assert.equal(response.headers.get('Content-Security-Policy'), "default-src 'self'");
    } finally { globalThis.fetch = original; }
});
