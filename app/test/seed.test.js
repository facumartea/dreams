// pruebas de datos de desarrollo: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { seed_database: inicializar_base_de_datos } = require('../server/seed');

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
    await inicializar_base_de_datos(database);
    assert.equal(upsert_calls, 0);
});

test('el seed carga el catálogo sólo cuando está vacío', async () => {
    delete process.env.ADMIN_PASSWORD;
    let inserted_rows;
    let inserted_options;
    const database = {
        from(table) {
            assert.equal(table, 'products');
            return {
                async select() { return { count: 0, error: null }; },
                async upsert(rows, options) {
                    inserted_rows = rows;
                    inserted_options = options;
                    return { error: null };
                }
            };
        }
    };
    await inicializar_base_de_datos(database);
    assert.equal(inserted_rows.length, 31);
    assert.deepEqual(inserted_options, { onConflict: 'brand,name', ignoreDuplicates: true });
});
