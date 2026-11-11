import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { official_release_ready } from '../scripts/official-release-gate.mjs';
const now = Date.parse('2026-10-27T17:00:00Z');
const good = () => ({ deployment_ready: true, official_service: 'dreams-official-backend', official_version: 'fixture-version',
    candidate_read: { status: 200, project_url: 'https://nwsmbemwtexmrtpkgxrz.supabase.co', backend_version: 'fixture-version', checked_at: new Date(now).toISOString() },
    authenticated_qa: { backend_version: 'fixture-version', registration: true, sessions: true, cart_isolation: true, review_ownership: true, admin_persistence: true, academic_compatibility: true } });
test('restored official release cannot be deployed by merely changing the ready boolean', () => {
    const release = JSON.parse(readFileSync(new URL('../pages/official-release.json', import.meta.url), 'utf8'));
    assert.equal(official_release_ready(release, now), false); release.deployment_ready = true;
    assert.equal(official_release_ready(release, now), false);
});
test('minimal candidate read must succeed on the expected project/version and be recent', () => {
    assert.equal(official_release_ready(good(), now), true);
    for (const extra of [{ status: 401 }, { project_url: 'https://other.invalid' }, { backend_version: 'older-version' }, { checked_at: new Date(now - 3600001).toISOString() }, { checked_at: new Date(now + 1000).toISOString() }]) {
        const release = good(); Object.assign(release.candidate_read, extra); assert.equal(official_release_ready(release, now), false);
    }
});
test('a successful read never substitutes authenticated customer/Admin and academic QA', () => {
    for (const name of ['registration', 'sessions', 'cart_isolation', 'review_ownership', 'admin_persistence', 'academic_compatibility']) {
        const release = good(); release.authenticated_qa[name] = false; assert.equal(official_release_ready(release, now), false);
    }
    const release = good(); release.authenticated_qa.backend_version = 'older-version'; assert.equal(official_release_ready(release, now), false);
});
