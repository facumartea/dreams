import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = {};
const release = JSON.parse(await readFile(new URL('../pages/official-release.json', import.meta.url), 'utf8'));
if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(release.backend_url)) throw new Error('Pages requires an immutable approved backend URL');
for (const [pathname, relative, content_type] of [
    ['/index.html', 'public/index.html', 'text/html; charset=utf-8'],
    ['/css/style.css', 'public/css/style.css', 'text/css; charset=utf-8'],
    ['/js/motion.js', 'public/js/motion.js', 'application/javascript; charset=utf-8']
]) {
    const body = await readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
    assets[pathname] = { body, content_type, etag: `"${createHash('sha256').update(body).digest('hex')}"` };
}
assets['/'] = assets['/index.html'];
const proxy = await readFile(new URL('../pages/proxy.mjs', import.meta.url), 'utf8');
await mkdir(new URL('../dist/pages/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/pages/_worker.js', import.meta.url),
    proxy.replace('export default create_proxy();', `export default create_proxy(${JSON.stringify(assets)}, ${JSON.stringify({ backend_url: release.backend_url })});`));
await writeFile(new URL('../dist/pages/_routes.json', import.meta.url), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log(`Pages built: static homepage overlay; all other routes pinned to source ${release.source_commit}. Secrets remain server-only.`);
