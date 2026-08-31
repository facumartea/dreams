const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260828144944_production_baseline.sql'), 'utf8');
const checkout_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260831024826_checkout_orders_and_coupons.sql'), 'utf8');
const demo_checkout_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260831040000_enable_demo_checkout_provider.sql'), 'utf8');

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

test('checkout y cupones son server-only, tienen RLS y constraints de integridad', () => {
    for (const table of ['orders', 'coupons']) assert.match(checkout_migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
    assert.match(checkout_migration, /revoke all on table public\.coupons from public, anon, authenticated/i);
    assert.match(checkout_migration, /revoke all on table public\.orders from public, anon, authenticated/i);
    assert.match(checkout_migration, /discount_percent > 0 and discount_percent <= 100/i);
    assert.match(checkout_migration, /code = upper\(code\)/i);
    assert.match(checkout_migration, /total = subtotal - discount/i);
});

test('migración checkout no borra tablas ni datos existentes', () => {
    assert.doesNotMatch(checkout_migration, /\bdrop\s+table\b/i);
    assert.doesNotMatch(checkout_migration, /\btruncate\b/i);
    assert.doesNotMatch(checkout_migration, /\bdelete\s+from\b/i);
});

test('migración demo conserva Mercado Pago y sólo amplía proveedores permitidos', () => {
    assert.match(demo_checkout_migration, /provider in \('mercado_pago', 'demo'\)/i);
    assert.doesNotMatch(demo_checkout_migration, /\bdrop\s+table\b|\btruncate\b|\bdelete\s+from\b/i);
});
