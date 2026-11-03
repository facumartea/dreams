import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const footer = (await readFile(new URL('templates/public-footer.html', root), 'utf8')).trim();
for (const page of ['index', 'catalogo', 'producto', 'nosotros', 'carrito', 'cuenta', 'checkout', 'checkout-resultado']) {
    const file = new URL(`public/${page}.html`, root);
    const source = await readFile(file, 'utf8');
    await writeFile(file, source.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer));
}
console.log('Shared public footer synchronized.');
