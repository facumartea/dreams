const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const data_dir = process.env.DATABASE_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
fs.mkdirSync(data_dir, { recursive: true });

const database = new Database(path.join(data_dir, 'dreams.db'));
database.pragma('foreign_keys = ON');
database.pragma('journal_mode = WAL');

database.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'diseñador',
    size_ml INTEGER NOT NULL DEFAULT 100,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    intensity INTEGER NOT NULL DEFAULT 4,
    family TEXT NOT NULL,
    top_notes TEXT NOT NULL,
    heart_notes TEXT NOT NULL,
    base_notes TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
`);

function add_column_if_missing(table, column, definition) {
    const columns = database.prepare(`PRAGMA table_info(${table})`).all();
    if (!columns.some(item => item.name === column)) {
        database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

add_column_if_missing('products', 'stock', 'INTEGER NOT NULL DEFAULT 0');

module.exports = database;
