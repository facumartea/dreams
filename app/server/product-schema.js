// adapta brand y marca sin cambiar los campos del api ni ocultar fallos de conexion.
// conserva el contrato del api y adapta el nombre de columna que usa la base.
function obtener_columna_de_marca(value) {
    if (!['brand', 'marca'].includes(value)) throw new TypeError('Columna de marca inválida.');
    return value;
}

function normalizar_marca_del_perfume(row) {
    const { marca, ...product } = row;
    return { ...product, brand: row.brand ?? marca };
}

function preparar_datos_para_guardar_perfume(value, column) {
    const { brand, ...fields } = value;
    return { ...fields, [obtener_columna_de_marca(column)]: brand };
}

async function detectar_columna_de_marca(database) {
    for (const column of ['marca', 'brand']) {
        const result = await database.from('products').select(column).limit(1);
        if (!result.error) return column;
        // solo una columna inexistente permite probar el nombre alternativo; si falla la conexion
        // o faltan permisos, se detiene el inicio para no elegir un esquema equivocado.
        if (!['42703', 'PGRST204'].includes(result.error.code)) throw result.error;
    }
    throw new Error('products no contiene una columna de marca compatible.');
}

module.exports = { brand_column: obtener_columna_de_marca, normalize_product_brand: normalizar_marca_del_perfume, product_write_payload: preparar_datos_para_guardar_perfume, resolve_product_brand_column: detectar_columna_de_marca };
