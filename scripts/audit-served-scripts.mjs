import { readdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inventory } from './function-inventory.mjs';

const origin = 'https://dreams-perfumes.pages.dev';
const digest = text => createHash('sha256').update(text).digest('hex');

// Sólo lee la oficial. El fetch opcional permite usar una sesión Admin en memoria.
export async function audit_served_scripts(fetcher = fetch) {
    const root = new URL('../public/js/', import.meta.url);
    const names = (await readdir(root)).filter(name => /^[a-z0-9-]+\.js$/.test(name));
    const entries = names.map(name => [name, name]);
    entries.push(['admin-console-v3.js', 'admin.js']);
    const temporary = await mkdtemp(join(tmpdir(), 'dreams-served-scripts-'));
    const assets = [];
    try {
        for (const [name, source] of entries) {
            const response = await fetcher(`${origin}/js/${name}`, { headers: { 'Cache-Control': 'no-cache' } });
            const local = await readFile(new URL(source, root), 'utf8');
            const body = response.ok ? await response.text() : '';
            assets.push({ url: `${origin}/js/${name}`, source: `public/js/${source}`, status: response.status,
                sha256: response.ok ? digest(body) : null, approved_sha256: digest(local), matches: response.ok && digest(body) === digest(local) });
            if (response.ok) await writeFile(join(temporary, name), body);
        }
        const parsed = await inventory(temporary);
        return { origin, checked_at: new Date().toISOString(), assets, files: parsed.files, records: parsed.records,
            maximum: Math.max(0, ...parsed.records.map(row => row.lines)), violations: parsed.violations,
            pass: assets.every(asset => asset.matches) && !parsed.violations.length };
    } finally { await rm(temporary, { recursive: true, force: true }); }
}

async function main() {
    const report = await audit_served_scripts();
    if (process.argv[2]) await writeFile(resolve(process.argv[2]), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ pass: report.pass, files: report.files, maximum: report.maximum,
        mismatches: report.assets.filter(asset => !asset.matches).map(asset => ({ url: asset.url, status: asset.status })) }));
    if (!report.pass) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
