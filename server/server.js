require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const morgan = require('morgan');
const database = require('./db');
const { seed_database } = require('./seed');

const app = express();
const port = Number(process.env.PORT || 3000);
const admin_email = process.env.ADMIN_EMAIL || 'admin@dreamsperfumes.com';
const whatsapp_number = process.env.WHATSAPP_NUMBER || '542944502390';
const is_production = process.env.NODE_ENV === 'production';

seed_database();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dreams_change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: is_production,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(express.static(path.join(__dirname, '..', 'public')));

function require_login(request, response, next) {
    if (!request.session.user) {
        return response.status(401).json({ error: 'Necesitás iniciar sesión.' });
    }
    next();
}

function require_admin(request, response, next) {
    if (!request.session.user || !request.session.user.is_admin) {
        return response.status(403).json({ error: 'Acceso reservado al administrador.' });
    }
    next();
}

function product_from_row(row) {
    return {
        ...row,
        featured: Boolean(row.featured),
        stock: Number(row.stock || 0),
        notes: {
            salida: row.top_notes.split(',').map(note => note.trim()),
            corazon: row.heart_notes.split(',').map(note => note.trim()),
            fondo: row.base_notes.split(',').map(note => note.trim())
        }
    };
}

function validate_product(product) {
    const required_fields = ['brand', 'name', 'gender', 'category', 'size_ml', 'price', 'stock', 'intensity', 'family', 'top_notes', 'heart_notes', 'base_notes', 'description', 'image_url'];
    if (required_fields.some(field => product[field] === undefined || product[field] === '')) {
        return 'Completá todos los campos del producto.';
    }
    if (!['hombre', 'mujer', 'unisex'].includes(product.gender)) return 'Género inválido.';
    if (!['diseñador', 'nicho'].includes(product.category)) return 'Categoría inválida.';
    if (Number(product.price) < 0 || Number(product.stock) < 0 || Number(product.size_ml) <= 0) return 'Precio, stock y tamaño deben ser válidos.';
    if (Number(product.intensity) < 1 || Number(product.intensity) > 5) return 'La intensidad debe estar entre 1 y 5.';
    return null;
}

app.get('/api/config', (request, response) => {
    response.json({ whatsapp_number, admin_email, app_name: 'DREAMS' });
});

app.get('/api/products', (request, response) => {
    const search = String(request.query.search || '').trim();
    const brand = String(request.query.brand || '').trim();
    const gender = String(request.query.gender || '').trim();
    const category = String(request.query.category || '').trim();
    const sort = String(request.query.sort || 'featured').trim();
    const max_price = Number(request.query.max_price || 0);

    let sql = 'SELECT * FROM products WHERE 1 = 1';
    const params = [];
    if (search) { sql += ' AND (name LIKE ? OR brand LIKE ? OR family LIKE ?)'; const term = `%${search}%`; params.push(term, term, term); }
    if (brand) { sql += ' AND brand = ?'; params.push(brand); }
    if (gender) { sql += ' AND gender = ?'; params.push(gender); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (max_price > 0) { sql += ' AND price <= ?'; params.push(max_price); }
    if (sort === 'price_asc') sql += ' ORDER BY price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
    else if (sort === 'name') sql += ' ORDER BY name ASC';
    else sql += ' ORDER BY featured DESC, id DESC';

    response.json(database.prepare(sql).all(...params).map(product_from_row));
});

app.get('/api/products/:id', (request, response) => {
    const product = database.prepare('SELECT * FROM products WHERE id = ?').get(Number(request.params.id));
    if (!product) return response.status(404).json({ error: 'Perfume no encontrado.' });
    response.json(product_from_row(product));
});

app.get('/api/brands', (request, response) => {
    response.json(database.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all().map(item => item.brand));
});

app.post('/api/auth/register', async (request, response) => {
    const { name, email, password } = request.body;
    if (!name || !email || !password) return response.status(400).json({ error: 'Completá todos los campos.' });
    if (password.length < 6) return response.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    const normalized_email = String(email).trim().toLowerCase();
    if (database.prepare('SELECT id FROM users WHERE email = ?').get(normalized_email)) return response.status(409).json({ error: 'Ese correo ya está registrado.' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = database.prepare('INSERT INTO users (name,email,password_hash,is_admin) VALUES (?,?,?,0)').run(name.trim(), normalized_email, password_hash);
    const user = { id: result.lastInsertRowid, name: name.trim(), email: normalized_email, is_admin: false };
    request.session.user = user;
    response.json({ message: 'Cuenta creada correctamente.', user });
});

app.post('/api/auth/login', async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) return response.status(400).json({ error: 'Ingresá correo y contraseña.' });
    const normalized_email = String(email).trim().toLowerCase();
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(normalized_email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return response.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    request.session.user = { id: user.id, name: user.name, email: user.email, is_admin: Boolean(user.is_admin) };
    response.json({ message: 'Sesión iniciada.', user: request.session.user });
});

app.post('/api/auth/logout', (request, response) => request.session.destroy(() => response.json({ message: 'Sesión cerrada.' })));
app.get('/api/auth/me', (request, response) => response.json({ user: request.session.user || null }));

app.get('/api/favorites', require_login, (request, response) => {
    const rows = database.prepare('SELECT p.* FROM products p INNER JOIN favorites f ON f.product_id = p.id WHERE f.user_id = ? ORDER BY f.created_at DESC').all(request.session.user.id);
    response.json(rows.map(product_from_row));
});

app.get('/api/favorites/:product_id/check', require_login, (request, response) => {
    const favorite = database.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?').get(request.session.user.id, Number(request.params.product_id));
    response.json({ favorite: Boolean(favorite) });
});

app.post('/api/favorites/:product_id', require_login, (request, response) => {
    const product_id = Number(request.params.product_id);
    const existing = database.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?').get(request.session.user.id, product_id);
    if (existing) {
        database.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(request.session.user.id, product_id);
        return response.json({ favorite: false });
    }
    database.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(request.session.user.id, product_id);
    response.json({ favorite: true });
});

app.get('/api/reviews', (request, response) => response.json(database.prepare('SELECT id,user_name,rating,comment,created_at FROM reviews ORDER BY id DESC').all()));
app.post('/api/reviews', require_login, (request, response) => {
    const rating = Number(request.body.rating);
    const comment = String(request.body.comment || '').trim();
    if (!rating || rating < 1 || rating > 5 || !comment) return response.status(400).json({ error: 'Completá una puntuación y una opinión.' });
    database.prepare('INSERT INTO reviews (user_name,rating,comment) VALUES (?,?,?)').run(request.session.user.name, rating, comment);
    response.json({ message: 'Opinión publicada.' });
});

app.post('/api/inquiries', async (request, response) => {
    const product_id = Number(request.body.product_id || 0);
    const product = database.prepare('SELECT id,name FROM products WHERE id = ?').get(product_id);
    if (!product) return response.status(404).json({ error: 'Producto no encontrado.' });
    const user = request.session.user || null;
    database.prepare('INSERT INTO inquiries (user_id,product_id,product_name,user_name,user_email) VALUES (?,?,?,?,?)').run(user?.id || null, product.id, product.name, user?.name || null, user?.email || null);
    const text = encodeURIComponent(`Hola DREAMS, quiero consultar por ${product.name}. ¿Está disponible?`);
    response.json({ message: 'Consulta registrada.', whatsapp_url: `https://wa.me/${whatsapp_number}?text=${text}` });
});

app.get('/api/admin/stats', require_admin, (request, response) => {
    const stats = {
        products: database.prepare('SELECT COUNT(*) AS total FROM products').get().total,
        users: database.prepare('SELECT COUNT(*) AS total FROM users').get().total,
        favorites: database.prepare('SELECT COUNT(*) AS total FROM favorites').get().total,
        inquiries: database.prepare('SELECT COUNT(*) AS total FROM inquiries').get().total,
        reviews: database.prepare('SELECT COUNT(*) AS total FROM reviews').get().total,
        low_stock: database.prepare('SELECT COUNT(*) AS total FROM products WHERE stock <= 2').get().total
    };
    response.json(stats);
});

app.get('/api/admin/products', require_admin, (request, response) => response.json(database.prepare('SELECT * FROM products ORDER BY id DESC').all().map(product_from_row)));

app.post('/api/admin/products', require_admin, (request, response) => {
    const product = request.body;
    const error = validate_product(product);
    if (error) return response.status(400).json({ error });
    const result = database.prepare(`INSERT INTO products (brand,name,gender,category,size_ml,price,stock,intensity,family,top_notes,heart_notes,base_notes,description,image_url,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(product.brand,product.name,product.gender,product.category,Number(product.size_ml),Number(product.price),Number(product.stock),Number(product.intensity),product.family,product.top_notes,product.heart_notes,product.base_notes,product.description,product.image_url,product.featured ? 1 : 0);
    response.status(201).json(product_from_row(database.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)));
});

app.put('/api/admin/products/:id', require_admin, (request, response) => {
    const product_id = Number(request.params.id);
    const product = request.body;
    if (!database.prepare('SELECT id FROM products WHERE id = ?').get(product_id)) return response.status(404).json({ error: 'Producto no encontrado.' });
    const error = validate_product(product);
    if (error) return response.status(400).json({ error });
    database.prepare(`UPDATE products SET brand=?,name=?,gender=?,category=?,size_ml=?,price=?,stock=?,intensity=?,family=?,top_notes=?,heart_notes=?,base_notes=?,description=?,image_url=?,featured=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(product.brand,product.name,product.gender,product.category,Number(product.size_ml),Number(product.price),Number(product.stock),Number(product.intensity),product.family,product.top_notes,product.heart_notes,product.base_notes,product.description,product.image_url,product.featured ? 1 : 0,product_id);
    response.json(product_from_row(database.prepare('SELECT * FROM products WHERE id = ?').get(product_id)));
});

app.delete('/api/admin/products/:id', require_admin, (request, response) => {
    const result = database.prepare('DELETE FROM products WHERE id = ?').run(Number(request.params.id));
    if (!result.changes) return response.status(404).json({ error: 'Producto no encontrado.' });
    response.json({ message: 'Producto eliminado.' });
});

app.get('/api/admin/users', require_admin, (request, response) => response.json(database.prepare('SELECT id,name,email,is_admin,created_at FROM users ORDER BY id DESC').all().map(user => ({ ...user, is_admin: Boolean(user.is_admin) }))));
app.get('/api/admin/inquiries', require_admin, (request, response) => response.json(database.prepare('SELECT i.*, p.brand, p.name FROM inquiries i LEFT JOIN products p ON p.id=i.product_id ORDER BY i.id DESC LIMIT 100').all()));
app.get('/api/admin/reviews', require_admin, (request, response) => response.json(database.prepare('SELECT * FROM reviews ORDER BY id DESC').all()));

app.get('/admin', (request, response) => {
    if (!request.session.user || !request.session.user.is_admin) return response.redirect('/cuenta.html?admin=1');
    response.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

app.get('/admin.html', (request, response) => {
    if (!request.session.user || !request.session.user.is_admin) return response.redirect('/cuenta.html?admin=1');
    response.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

app.get('/api/external/rates', async (request, response) => {
    try {
        const external_response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!external_response.ok) throw new Error('API externa no disponible');
        const data = await external_response.json();
        response.json({ source: 'ExchangeRate API', usd_ars: data.rates?.ARS || null, updated: data.time_last_update_utc || null });
    } catch (error) {
        response.status(503).json({ error: 'No se pudo consultar la API externa.' });
    }
});

app.get('/api/health', (request, response) => response.json({ status: 'ok', api: true, database: true, environment: process.env.NODE_ENV || 'development', volume: process.env.RAILWAY_VOLUME_MOUNT_PATH || null }));

app.use((request, response) => {
    if (request.path.startsWith('/api/')) return response.status(404).json({ error: 'Ruta API no encontrada.' });
    response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`DREAMS funcionando en el puerto ${port}`);
    console.log(`Admin: ${admin_email}`);
    console.log(`WhatsApp: +${whatsapp_number}`);
    console.log(`Base de datos: ${process.env.DATABASE_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || 'data/'}`);
});
