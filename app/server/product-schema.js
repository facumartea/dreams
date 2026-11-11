// adapta el campo de marca de la base sin cambiar la respuesta que recibe la pagina.
function brand_column(value) {
    if (!['brand', 'marca'].includes(value)) throw new TypeError('Columna de marca inválida.');
    return value;
}

function normalize_product_brand(row) {
    const { marca, ...product } = row;
    return { ...product, brand: row.brand ?? marca };
}

function product_write_payload(value, column) {
    const { brand, ...fields } = value;
    return { ...fields, [brand_column(column)]: brand };
}

async function resolve_product_brand_column(database) {
    for (const column of ['marca', 'brand']) {
        const result = await database.from('products').select(column).limit(1);
        if (!result.error) return column;
        // solo una columna inexistente permite probar el nombre anterior.
        // los errores de conexion o permisos deben detener el arranque.
        if (!['42703', 'PGRST204'].includes(result.error.code)) throw result.error;
    }
    throw new Error('products no contiene una columna de marca compatible.');
}

module.exports = { brand_column, normalize_product_brand, product_write_payload, resolve_product_brand_column };
