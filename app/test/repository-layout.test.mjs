// pruebas de repository layout: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access, readFile } from 'node:fs/promises';

// la raiz se mantiene clara sin sacrificar instalacion, pruebas o publicacion futura.
test('la raíz sólo contiene README y la aplicación conserva sus archivos necesarios', async () => {
    const root = new URL('../../', import.meta.url);
    const entries = await readdir(root, { withFileTypes: true });
    assert.deepEqual(entries.filter(entry => entry.isFile()).map(entry => entry.name), ['README.md']);
    for (const file of ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.gitignore',
        '.env.example', 'wrangler.jsonc', 'wrangler.official.jsonc', 'pages/wrangler.jsonc',
        'server/server.js', 'supabase/schema.sql', 'public/robots.txt', 'public/sitemap.xml']) {
        await access(new URL(`app/${file}`, root));
    }
    await access(new URL('.github/workflows/ci.yml', root));
    const readme = await readFile(new URL('README.md', root), 'utf8');
    assert.match(readme, /cd app/);
});
