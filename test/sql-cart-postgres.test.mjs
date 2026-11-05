import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const container = process.env.DREAMS_SQL_QA_CONTAINER;
const run = promisify(execFile);
const docker = ['--host=unix:///var/run/docker.sock', 'exec', '-i', container || 'unused', 'psql', '-U', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1'];
const original = 'supabase/migrations/20261013032746_account_carts.sql';
const migration = 'supabase/migrations/20261105155756_modularize_account_cart.sql';
const old_user = '00000000-0000-4000-8000-000000000001';
const new_user = '00000000-0000-4000-8000-000000000002';
const sql = text => execFileSync('docker', docker, { input: text, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const invoke = (name, user, operation, id) => `select public.${name}('${user}','${id}','${JSON.stringify(operation)}'::jsonb);`;

before(() => {
    if (!container) return;
    sql(readFileSync('test/fixtures/cart-postgres.sql', 'utf8'));
    sql(readFileSync(original, 'utf8'));
    sql('alter function public.dreams_cart_operation(uuid,uuid,jsonb) rename to baseline_cart_operation;');
    sql(readFileSync(migration, 'utf8'));
});

function compare_sequence(operations) {
    for (const operation of operations) {
        const id = randomUUID();
        const expected = JSON.parse(sql(invoke('baseline_cart_operation', old_user, operation, id)));
        const actual = JSON.parse(sql(invoke('dreams_cart_operation', new_user, operation, id)));
        assert.deepEqual(actual, expected);
        // La misma operación no vuelve a incrementar revisión ni cantidades.
        assert.deepEqual(JSON.parse(sql(invoke('dreams_cart_operation', new_user, operation, id))), actual);
    }
}

test('PostgreSQL: equivalencia, límites de stock, merge, remove y consume', { skip: !container }, () => {
    compare_sequence([
        { type: 'clear' }, { type: 'delta', id: 1, delta: 2 },
        { type: 'merge', items: [{ id: 1, quantity: 1 }, { id: 100, quantity: 8 }] },
        { type: 'delta', id: 99, delta: 1 }, { type: 'delta', id: 500, delta: 1 },
        { type: 'delta', id: 1, delta: 150 }, { type: 'delta', id: 1, delta: -5 },
        { type: 'consume', items: [{ id: 1, quantity: 1 }] },
        { type: 'remove', id: 1 }, { type: 'consume', items: [{ id: 100, quantity: 2 }] },
        { type: 'consume', items: [] }, { type: 'clear' }
    ]);
});

test('PostgreSQL: errores revierten carrito e idempotencia en una transacción', { skip: !container }, () => {
    const id = randomUUID();
    sql(invoke('dreams_cart_operation', new_user, { type: 'delta', id: 1, delta: 1 }, id));
    const before = sql(`select row_to_json(c) from account_carts c where user_id='${new_user}';`);
    assert.throws(() => sql(invoke('dreams_cart_operation', new_user, { type: 'clear' }, id)));
    assert.throws(() => sql(invoke('dreams_cart_operation', new_user, { type: 'unknown' }, randomUUID())));
    const items = Array.from({ length: 31 }, (_, n) => ({ id: n + 1, quantity: 1 }));
    assert.throws(() => sql(invoke('dreams_cart_operation', new_user, { type: 'merge', items }, randomUUID())));
    assert.equal(sql(`select row_to_json(c) from account_carts c where user_id='${new_user}';`), before);
});

test('PostgreSQL: auxiliares invoker y denegación anónima/customer', { skip: !container }, () => {
    const functions = ['dreams_cart_sorted(jsonb)', 'dreams_cart_adjust(jsonb,jsonb,text)', 'dreams_cart_desired(jsonb,jsonb)', 'dreams_cart_operation(uuid,uuid,jsonb)'];
    for (const signature of functions) {
        assert.equal(sql(`select prosecdef from pg_proc where oid='public.${signature}'::regprocedure;`), 'f');
        for (const role of ['anon', 'authenticated', 'service_role']) {
            assert.equal(sql(`select has_function_privilege('${role}','public.${signature}','execute');`), role === 'service_role' ? 't' : 'f');
        }
    }
    assert.throws(() => sql(`set role authenticated; ${invoke('dreams_cart_operation', new_user, { type: 'clear' }, randomUUID())}`));
    assert.doesNotThrow(() => sql(`set role service_role; ${invoke('dreams_cart_operation', new_user, { type: 'clear' }, randomUUID())}`));
});

test('PostgreSQL: bloqueo concurrente evita perder incrementos', { skip: !container }, async () => {
    sql(invoke('dreams_cart_operation', new_user, { type: 'clear' }, randomUUID()));
    await Promise.all(Array.from({ length: 12 }, () => run('docker', [...docker.filter(x => x !== '-i'), '-c', invoke('dreams_cart_operation', new_user, { type: 'delta', id: 1, delta: 1 }, randomUUID())])));
    assert.equal(sql(`select items->0->>'quantity' from account_carts where user_id='${new_user}';`), '12');
});
