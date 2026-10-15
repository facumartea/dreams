import { mkdir, readFile, writeFile } from 'node:fs/promises';

const release = JSON.parse(await readFile(new URL('../pages/animated-release.json', import.meta.url), 'utf8'));
if (release.project !== 'dreams-preview' || release.origin !== 'https://dreams-preview.pages.dev') throw new Error('Unexpected preview destination');
if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(release.backend_url)) throw new Error('Immutable preview backend required');
const proxy = await readFile(new URL('../pages/animated-proxy.mjs', import.meta.url), 'utf8');
await mkdir(new URL('../dist/animated-pages/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/animated-pages/_worker.js', import.meta.url), proxy + `\nexport default create_animated_proxy(${JSON.stringify(release.backend_url)});\n`);
await writeFile(new URL('../dist/animated-pages/_routes.json', import.meta.url), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }));
console.log(`Animated preview Pages proxy built for ${release.origin}; no public assets or secrets copied.`);
