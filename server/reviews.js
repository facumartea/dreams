const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const public_name = name => typeof name === 'string' && !name.includes('@') ? name.trim().slice(0, 80) || 'Cliente' : 'Cliente';
const columns = 'id,user_id,user_name,rating,comment,created_at';
function review_input(body) {
    if (!body || Object.keys(body).some(key => !['rating', 'comment', 'operation_id'].includes(key))) return null;
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 || typeof body.comment !== 'string' || !uuid(body.operation_id)) return null;
    const comment = body.comment.trim();
    return comment && comment.length <= 1000 ? { rating: body.rating, comment, operation_id: body.operation_id } : null;
}
async function list_reviews(request, response, database) {
    const result = await database.from('reviews').select(columns).order('id', { ascending: false });
    if (result.error) throw result.error;
    response.json(result.data.map(row => ({ id: row.id, rating: row.rating, comment: row.comment, created_at: row.created_at, user_name: public_name(row.user_name), can_delete: Boolean(request.user && row.user_id === request.user.id) })));
}
async function publish_review(request, response, database) {
    const input = review_input(request.body);
    if (!input) return response.status(400).json({ error: 'Elegí una puntuación de 1 a 5 y escribí una opinión de hasta 1000 caracteres.' });
    const row = { ...input, user_id: request.user.id, user_name: public_name(request.user.name) };
    const result = await database.from('reviews').insert(row);
    if (result.error?.code === '23505') return replay_review(request, response, database, input);
    if (result.error) throw result.error;
    response.status(201).json({ message: 'Opinión publicada.' });
}
async function replay_review(request, response, database, input) {
    const result = await database.from('reviews').select('rating,comment').eq('user_id', request.user.id).eq('operation_id', input.operation_id).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data || result.data.rating !== input.rating || result.data.comment !== input.comment) return response.status(409).json({ error: 'La opinión cambió. Revisala antes de volver a publicar.' });
    response.json({ message: 'Opinión publicada.' });
}
async function delete_own_review(request, response, create_auth_client) {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id <= 0 || Object.keys(request.body || {}).length) return response.status(400).json({ error: 'Solicitud de eliminación inválida.' });
    // JWT limitado más predicado de dueño: la clave de servicio nunca elimina aquí.
    const result = await create_auth_client(request.access_token).from('reviews').delete().eq('id', id).eq('user_id', request.user.id).select('id').maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return response.status(404).json({ error: 'No encontramos una opinión propia para eliminar.' });
    response.json({ message: 'Tu opinión fue eliminada.' });
}
function install_reviews({ route, login, database, create_auth_client }) {
    route('get', '/api/reviews', (req, res) => list_reviews(req, res, database));
    route('post', '/api/reviews', login, (req, res) => publish_review(req, res, database));
    route('delete', '/api/reviews/:id', login, (req, res) => delete_own_review(req, res, create_auth_client));
}
module.exports = { install_reviews, public_name, review_input };
