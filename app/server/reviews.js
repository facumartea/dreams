// asocia las opiniones a la sesion y verifica al dueno antes de eliminar una propia.
// opiniones vinculadas a la sesion verificada; el cliente no elige el autor ni su rol.
const es_identificador_uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const obtener_nombre_publico = name => typeof name === 'string' && !name.includes('@') ? name.trim().slice(0, 80) || 'Cliente' : 'Cliente';
const columns = 'id,user_id,user_name,rating,comment,created_at';
function validar_entrada_de_opinion(body) {
    if (!body || Object.keys(body).some(key => !['rating', 'comment', 'operation_id'].includes(key))) return null;
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 ||
        typeof body.comment !== 'string' || !es_identificador_uuid(body.operation_id)) return null;
    const comment = body.comment.trim();
    return comment && comment.length <= 1000 ? { rating: body.rating, comment, operation_id: body.operation_id } : null;
}
async function listar_opiniones(solicitud, respuesta, database) {
    const result = await database.from('reviews').select(columns).order('id', { ascending: false });
    if (result.error) throw result.error;
    respuesta.json(result.data.map(row => ({ id: row.id, rating: row.rating, comment: row.comment, created_at: row.created_at, user_name: obtener_nombre_publico(row.user_name), can_delete: Boolean(solicitud.user && row.user_id === solicitud.user.id) })));
}
async function publicar_opinion(solicitud, respuesta, database) {
    const input = validar_entrada_de_opinion(solicitud.body);
    if (!input) return respuesta.status(400).json({ error: 'Elegí una puntuación de 1 a 5 y escribí una opinión de hasta 1000 caracteres.' });
    const row = { ...input, user_id: solicitud.user.id, user_name: obtener_nombre_publico(solicitud.user.name) };
    const result = await database.from('reviews').insert(row);
    if (result.error?.code === '23505') return recuperar_opinion(solicitud, respuesta, database, input);
    if (result.error) throw result.error;
    respuesta.status(201).json({ message: 'Opinión publicada.' });
}
// repetir el mismo uuid devuelve exito solo si el contenido coincide; evita duplicados por reintento.
async function recuperar_opinion(solicitud, respuesta, database, input) {
    const result = await database.from('reviews').select('rating,comment').eq('user_id', solicitud.user.id).eq('operation_id', input.operation_id).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data || result.data.rating !== input.rating || result.data.comment !== input.comment) return respuesta.status(409).json({ error: 'La opinión cambió. Revisala antes de volver a publicar.' });
    respuesta.json({ message: 'Opinión publicada.' });
}
// combina la sesion verificada y el filtro de dueno para impedir borrados ajenos.
async function eliminar_opinion_propia(solicitud, respuesta, create_auth_client) {
    const id = Number(solicitud.params.id);
    if (!Number.isSafeInteger(id) || id <= 0 || Object.keys(solicitud.body || {}).length) return respuesta.status(400).json({ error: 'Solicitud de eliminación inválida.' });
    // jwt limitado mas predicado de dueno: la clave de servicio nunca elimina aqui.
    const result = await create_auth_client(solicitud.access_token).from('reviews').delete().eq('id', id).eq('user_id', solicitud.user.id).select('id').maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return respuesta.status(404).json({ error: 'No encontramos una opinión propia para eliminar.' });
    respuesta.json({ message: 'Tu opinión fue eliminada.' });
}
function registrar_opiniones({ route, login, database, create_auth_client }) {
    route('get', '/api/reviews', (solicitud, respuesta) => listar_opiniones(solicitud, respuesta, database));
    route('post', '/api/reviews', login, (solicitud, respuesta) => publicar_opinion(solicitud, respuesta, database));
    route('delete', '/api/reviews/:id', login, (solicitud, respuesta) => eliminar_opinion_propia(solicitud, respuesta, create_auth_client));
}
module.exports = { install_reviews: registrar_opiniones, public_name: obtener_nombre_publico, review_input: validar_entrada_de_opinion };
