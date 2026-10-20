import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const release = JSON.parse(await readFile(new URL('../pages/animated-release.json', import.meta.url), 'utf8'));
if (release.project !== 'dreams-preview' || release.origin !== 'https://dreams-preview.pages.dev') throw new Error('Unexpected preview destination');
if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(release.backend_url)) throw new Error('Immutable preview backend required');
const proxy = await readFile(new URL('../pages/animated-proxy.mjs', import.meta.url), 'utf8');
const assets = {};
for (const [path, type] of [['/index.html', 'text/html'], ['/css/cinema.css', 'text/css'], ['/js/cinema-video.js', 'application/javascript'], ['/js/cinema-scroll.js', 'application/javascript']]) {
    const body = await readFile(new URL(`../public${path}`, import.meta.url), 'utf8');
    assets[path] = { body, content_type: `${type}; charset=utf-8`, etag: `"${createHash('sha256').update(body).digest('hex')}"` };
}
assets['/'] = assets['/index.html'];
await mkdir(new URL('../dist/animated-pages/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/animated-pages/_worker.js', import.meta.url), proxy + `\nexport default create_animated_proxy(${JSON.stringify(release.backend_url)}, fetch, ${JSON.stringify(assets)});\n`);
await writeFile(new URL('../dist/animated-pages/_routes.json', import.meta.url), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log(`Animated preview Pages built for ${release.origin}; homepage/CSS/motion overlay only, backend and media unchanged.`);
