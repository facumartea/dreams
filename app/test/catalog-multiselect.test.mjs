import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtered_catalog } from '../pages/catalog.mjs';
import { create_proxy } from '../pages/proxy.mjs';

const backend_url = 'https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev';
const rows = [
    { id: 1, brand: 'Chanel', gender: 'hombre' }, { id: 2, brand: 'Dior', gender: 'mujer' },
    { id: 3, brand: 'Chanel', gender: 'unisex' }, { id: 4, brand: null, gender: 'unisex' },
    { id: 5, brand: 'Byredo', gender: 'mujer' }
];
function request(values = {}, method = 'GET') {
    const params = new URLSearchParams(values);
    return new Request('https://dreams-perfumes.pages.dev/api/products?' + params, { method, headers: { Cookie: 'private=test', Authorization: 'Bearer test' } });
}
function options(data = rows) {
    const calls = [];
    return { backend_url, calls, fetch_backend: async req => { calls.push(req); return Response.json(data, { headers: { 'Cache-Control': 'public,max-age=60', ETag: 'old' } }); } };
}

test('API aplica OR dentro de cada lista y AND entre grupos sobre todo el catálogo antes de limit', async () => {
    const setup = options();
    const response = await filtered_catalog(request({ brand: '["Chanel","Dior"]', gender: '["mujer","unisex"]', limit: '1', sort: 'name', search: 'iris' }), setup);
    assert.deepEqual((await response.json()).map(row => row.id), [2]);
    const sent = setup.calls[0], url = new URL(sent.url);
    assert.equal(url.origin, backend_url);
    for (const key of ['brand', 'gender', 'limit', 'page']) assert.equal(url.searchParams.has(key), false);
    assert.equal(url.searchParams.get('sort'), 'name');
    assert.equal(url.searchParams.get('search'), 'iris');
    assert.equal(sent.headers.has('Cookie'), false);
    assert.equal(sent.headers.has('Authorization'), false);
    assert.equal(sent.redirect, 'manual');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.has('etag'), false);
});

test('todos, quitar última selección y marca ausente funcionan sin descartar otros grupos', async () => {
    const all = await filtered_catalog(request({ brand: '[]', gender: '[]' }), options());
    assert.equal((await all.json()).length, rows.length);
    const gender = await filtered_catalog(request({ brand: '[]', gender: '["unisex"]' }), options());
    assert.deepEqual((await gender.json()).map(row => row.id), [3, 4]);
    const none = await filtered_catalog(request({ brand: '["Inexistente"]' }), options());
    assert.deepEqual(await none.json(), []);
});

test('API rechaza listas inválidas antes de red; valores hostiles son texto y nunca consultas interpoladas', async () => {
    const setup = options();
    for (const brand of ['[bad', '[{}]', '[' + Array(51).fill('"Dior"').join(',') + ']']) {
        assert.equal((await filtered_catalog(request({ brand }), setup)).status, 400);
    }
    assert.equal((await filtered_catalog(request({ gender: '["admin"]' }), setup)).status, 400);
    assert.equal(setup.calls.length, 0);
    const result = await filtered_catalog(request({ brand: JSON.stringify(['Dior),role.eq.admin', '<script>']) }), setup);
    assert.deepEqual(await result.json(), []);
    assert.equal(new URL(setup.calls[0].url).search, '');
});

test('enlaces anteriores y rutas de escritura siguen en el backend sin excepción nueva', async () => {
    const setup = options();
    assert.equal(await filtered_catalog(request({ brand: 'Dior', gender: 'mujer' }), setup), null);
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const req = request({ brand: '["Dior"]' }, method);
        assert.equal(await filtered_catalog(req, setup), null);
    }
    assert.equal(setup.calls.length, 0);
    const proxy = create_proxy({}, { backend_url, fetch_backend: async () => Response.json({ error: 'protegido' }, { status: 403 }) });
    assert.equal((await proxy.fetch(request({ brand: '["Dior"]' }, 'POST'), {})).status, 403);
});

test('datos truncados, red fallida y respuestas no JSON no aparentan catálogo completo', async () => {
    const proxy = create_proxy({}, { backend_url, fetch_backend: async () => Response.json(Array.from({ length: 1000 }, (_, id) => ({ id }))) });
    assert.equal((await proxy.fetch(request({ brand: '["Dior"]' }), {})).status, 503);
    for (const fetch_backend of [async () => { throw new Error('offline'); }, async () => new Response('<html>error</html>')]) {
        assert.equal((await create_proxy({}, { backend_url, fetch_backend }).fetch(request({ brand: '["Dior"]' }), {})).status, 503);
    }
    const setup = { backend_url, fetch_backend: async () => Response.json({ error: 'no disponible' }, { status: 503 }) };
    assert.equal((await filtered_catalog(request({ brand: '["Dior"]' }), setup)).status, 503);
});

test('HEAD conserva la semántica sin cuerpo y un error del proveedor no se transforma en éxito', async () => {
    const response = await filtered_catalog(request({ brand: '["Dior"]' }, 'HEAD'), options());
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
    const setup = { backend_url, fetch_backend: async () => Response.json({ error: 'prohibido' }, { status: 403 }) };
    assert.equal((await filtered_catalog(request({ brand: '["Dior"]' }), setup)).status, 403);
});
