const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260828144944_production_baseline.sql'), 'utf8');
const checkout_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260831024826_checkout_orders_and_coupons.sql'), 'utf8');
const demo_checkout_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260831040000_enable_demo_checkout_provider.sql'), 'utf8');
const admin_rls_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260901090000_admin_authenticated_policies.sql'), 'utf8');
const admin_grants_migration = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '20260902090000_admin_orders_coupons_grants.sql'), 'utf8');

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

test('Admin usa RLS autenticado sin abrir permisos a anon', () => {
    assert.match(admin_rls_migration, /security definer[\s\S]*set search_path = ''/i);
    assert.match(admin_rls_migration, /where id = auth\.uid\(\) and role = 'admin'/i);
    assert.match(admin_rls_migration, /revoke all on function public\.is_dreams_admin\(\) from public, anon/i);
    for (const table of ['products', 'reviews', 'coupons']) assert.match(admin_rls_migration, new RegExp(`${table}_admin_`, 'i'));
    assert.doesNotMatch(admin_rls_migration, /disable row level security|grant all .* anon/i);
    assert.doesNotMatch(admin_rls_migration, /\bdrop\s+table\b|\btruncate\b|\bdelete\s+from\b/i);
});


test('Pedidos y cupones conceden sólo los privilegios Admin necesarios', () => {
    assert.match(admin_grants_migration, /grant select on table public\\.orders to authenticated/i);
    assert.match(admin_grants_migration, /grant select, insert, update, delete on table public\\.coupons to authenticated/i);
    assert.match(admin_grants_migration, /grant usage, select on sequence public\\.coupons_id_seq to authenticated/i);
    assert.doesNotMatch(admin_grants_migration, /\\bto anon\\b|disable row level security|grant all/i);
    assert.doesNotMatch(admin_grants_migration, /\\bdrop\\s+table\\b|\\btruncate\\b|\\bdelete\\s+from\\b/i);
});
