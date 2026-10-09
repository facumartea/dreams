import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const assets = {};
const release = JSON.parse(await readFile(new URL('../pages/official-release.json', import.meta.url), 'utf8'));
if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(release.backend_url)) throw new Error('Pages requires an immutable approved backend URL');
const footer = (await readFile(new URL('../templates/public-footer.html', import.meta.url), 'utf8')).trim();
for (const [pathname, relative, content_type] of [
    ['/index.html', 'public/index.html', 'text/html; charset=utf-8'],
    ['/nosotros.html', 'public/nosotros.html', 'text/html; charset=utf-8'],
    ['/catalogo.html', 'public/catalogo.html', 'text/html; charset=utf-8'],
    ['/producto.html', 'public/producto.html', 'text/html; charset=utf-8'],
    ['/carrito.html', 'public/carrito.html', 'text/html; charset=utf-8'],
    ['/cuenta.html', 'public/cuenta.html', 'text/html; charset=utf-8'],
    ['/checkout.html', 'public/checkout.html', 'text/html; charset=utf-8'],
    ['/checkout-resultado.html', 'public/checkout-resultado.html', 'text/html; charset=utf-8'],
    ['/js/motion.js', 'public/js/motion.js', 'application/javascript; charset=utf-8'],
    ['/js/app.js', 'public/js/app.js', 'application/javascript; charset=utf-8'],
    ['/js/catalogo.js', 'public/js/catalogo.js', 'application/javascript; charset=utf-8'],
    ['/js/navigation.js', 'public/js/navigation.js', 'application/javascript; charset=utf-8'],
    ['/css/style.css', 'public/css/style.css', 'text/css; charset=utf-8']
]) {
    let body = await readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
    if (content_type.startsWith('text/html')) body = body.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer);
    assets[pathname] = { body, content_type, etag: `"${createHash('sha256').update(body).digest('hex')}"` };
}
assets['/'] = assets['/index.html'];
const proxy = await readFile(new URL('../pages/proxy.mjs', import.meta.url), 'utf8');
await mkdir(new URL('../dist/pages/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/pages/_worker.js', import.meta.url),
    proxy.replace('export default create_proxy();', `export default create_proxy(${JSON.stringify(assets)}, ${JSON.stringify({ backend_url: release.backend_url })});`));
await writeFile(new URL('../dist/pages/_routes.json', import.meta.url), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log(`Pages built: shared public navigation/footer overlay; all other routes pinned to source ${release.source_commit}. Secrets remain server-only.`);
