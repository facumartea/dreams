import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access, readFile } from 'node:fs/promises';

// La raíz se mantiene clara sin sacrificar instalación, pruebas o publicación futura.
test('la raíz contiene README y la declaración de prompts sin perder archivos de la aplicación', async () => {
    const root = new URL('../../', import.meta.url);
    const entries = await readdir(root, { withFileTypes: true });
    assert.deepEqual(entries.filter(entry => entry.isFile()).map(entry => entry.name).sort(), ['DECLARACION_PROMPTS.md', 'README.md']);
    for (const file of ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.gitignore',
        '.env.example', 'wrangler.jsonc', 'wrangler.official.jsonc', 'pages/wrangler.jsonc',
        'server/server.js', 'supabase/schema.sql', 'public/robots.txt', 'public/sitemap.xml']) {
        await access(new URL(`app/${file}`, root));
    }
    await access(new URL('.github/workflows/ci.yml', root));
    const readme = await readFile(new URL('README.md', root), 'utf8');
    assert.match(readme, /cd app/);
});
