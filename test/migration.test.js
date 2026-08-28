const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260828144944_production_baseline.sql'), 'utf8');

test('baseline mantiene RLS y restringe funciones privilegiadas', () => {
    for (const table of ['profiles', 'products', 'favorites', 'reviews', 'inquiries']) {
        assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    }
    assert.match(migration, /security definer\s+set search_path = ''/i);
    assert.match(migration, /revoke all on function private\.create_profile_for_new_user\(\) from public, anon, authenticated/i);
    assert.match(migration, /values[\s\S]*'customer'[\s\S]*on conflict \(id\) do nothing/i);
});

test('baseline no contiene operaciones destructivas sobre tablas o datos', () => {
    assert.doesNotMatch(migration, /\bdrop\s+table\b/i);
    assert.doesNotMatch(migration, /\btruncate\b/i);
    assert.doesNotMatch(migration, /\bdelete\s+from\b/i);
});
