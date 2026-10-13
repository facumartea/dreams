// Prepara datos aislados de: el seed carga el catálogo sólo cuando está vacío.
async function preparar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_38(context) {
    delete process.env.ADMIN_PASSWORD;
    let inserted_rows;
    let inserted_options;
    Object.assign(context, { inserted_rows, inserted_options });
}

// Comprueba resultados observables de: el seed carga el catálogo sólo cuando está vacío.
async function verificar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_39(context) {
    const { inserted_rows, inserted_options } = context;
    const database = {
        from(table) {
            assert.equal(table, 'products');
            return {
                async select() { return { count: 0, error: null }; },
                async upsert(rows, options) {
                    context.inserted_rows = rows;
                    context.inserted_options = options;
                    return { error: null };
                }
            };
        }
    };
    Object.assign(context, { database });
}

// Comprueba resultados observables de: el seed carga el catálogo sólo cuando está vacío.
async function verificar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_40(context) {
    const { inserted_rows, inserted_options, database } = context;
    await seed_database(database);
    assert.equal(context.inserted_rows.length, 31);
    assert.deepEqual(context.inserted_options, { onConflict: 'brand,name', ignoreDuplicates: true });
}

const test = require('node:test');
const assert = require('node:assert/strict');
const { seed_database } = require('../server/seed');

test('el seed no sobrescribe un catálogo existente', async () => {
    delete process.env.ADMIN_PASSWORD;
    let upsert_calls = 0;
    const database = {
        from(table) {
            assert.equal(table, 'products');
            return {
                async select() { return { count: 31, error: null }; },
                async upsert() { upsert_calls += 1; return { error: null }; }
            };
        }
    };
    await seed_database(database);
    assert.equal(upsert_calls, 0);
});

test('el seed carga el catálogo sólo cuando está vacío', async () => {
    const context = {  };
    await preparar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_38(context);
    await verificar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_39(context);
    await verificar_el_seed_carga_el_catalogo_solo_cuando_esta_vacio_40(context);
});
