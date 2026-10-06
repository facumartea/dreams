import { mkdir, copyFile, writeFile } from 'node:fs/promises';

await mkdir(new URL('../dist/pages/', import.meta.url), { recursive: true });
await copyFile(new URL('../pages/proxy.mjs', import.meta.url), new URL('../dist/pages/_worker.js', import.meta.url));
await writeFile(new URL('../dist/pages/_routes.json', import.meta.url), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log('Pages advanced-mode proxy built; assets and server secrets remain in the existing Worker.');
