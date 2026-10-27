import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const release = JSON.parse(readFileSync(new URL('../pages/official-release.json', import.meta.url), 'utf8'));
if (release.deployment_ready !== true || release.official_service !== 'dreams-official-backend') throw new Error('Official deployment preconditions are incomplete');
const result = spawnSync('wrangler', ['pages', 'deploy', 'dist/pages', '--project-name', 'dreams-perfumes', '--branch', 'codex/cloudflare-hosting-migration', '--config', 'pages/wrangler.jsonc'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
