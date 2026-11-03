import { official_release_ready } from './official-release-gate.mjs';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const release = JSON.parse(readFileSync(new URL('../pages/official-release.json', import.meta.url), 'utf8'));
if (!official_release_ready(release)) throw new Error('Official deployment preconditions are incomplete');
const result = spawnSync('wrangler', ['pages', 'deploy', 'dist/pages', '--project-name', 'dreams-perfumes', '--branch', 'codex/cloudflare-hosting-migration', '--config', 'pages/wrangler.jsonc'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
