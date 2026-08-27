require('dotenv').config();

const image_urls = [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=900&q=85'
];

const products = [
    ['Dior', 'Sauvage Eau de Toilette', 'hombre', 'diseñador', 100, 245000, 6, 5, 'fresco, cítrico y amaderado', 'Bergamota de Calabria, pimienta', 'Lavanda, elemí', 'Ambroxán, cedro, maderas', 'Una fragancia fresca y potente con una firma amaderada reconocible.', 1],
    ['Dior', 'Sauvage Eau de Parfum', 'hombre', 'diseñador', 100, 295000, 5, 5, 'cítrico, ambarado y amaderado', 'Bergamota', 'Lavanda, nuez moscada', 'Vainilla, ambroxán, maderas', 'Una interpretación más intensa y envolvente de Sauvage.', 1],
    ['Dior', 'Dior Homme Intense', 'hombre', 'diseñador', 100, 315000, 4, 5, 'amaderado, floral y almizclado', 'Lavanda', 'Iris, pera', 'Vetiver, cedro', 'Elegante, profundo y sofisticado, pensado para la noche.', 1],
    ['Dior', 'Miss Dior Eau de Parfum', 'mujer', 'diseñador', 100, 320000, 5, 4, 'floral y amaderado', 'Pimienta rosa, naranja', 'Rosa, peonía', 'Pachulí, maderas', 'Una fragancia floral moderna y femenina.', 1],
    ['Chanel', 'Bleu de Chanel Eau de Parfum', 'hombre', 'diseñador', 100, 340000, 5, 5, 'amaderado aromático', 'Limón, menta', 'Jengibre, cedro', 'Sándalo, haba tonka, incienso', 'Elegancia limpia con un fondo amaderado profundo.', 1],
    ['Chanel', 'Coco Mademoiselle Eau de Parfum', 'mujer', 'diseñador', 100, 330000, 5, 4, 'cítrico, floral y pachulí', 'Naranja, bergamota', 'Rosa, jazmín', 'Pachulí, vetiver, vainilla', 'Una fragancia sofisticada y luminosa.', 1],
    ['Chanel', 'Chance Eau Tendre', 'mujer', 'diseñador', 100, 295000, 4, 3, 'floral afrutado', 'Pomelo, membrillo', 'Jazmín, jacinto', 'Almizcle, iris, cedro', 'Fresca, delicada y fácil de usar todos los días.', 0],
    ['Yves Saint Laurent', 'Y Eau de Parfum', 'hombre', 'diseñador', 100, 275000, 7, 5, 'aromático amaderado', 'Manzana, jengibre', 'Salvia, enebro', 'Vetiver, cedro, haba tonka', 'Una fragancia moderna y versátil con gran presencia.', 1],
    ['Yves Saint Laurent', 'Libre Eau de Parfum', 'mujer', 'diseñador', 90, 310000, 5, 4, 'floral ambarado', 'Lavanda, mandarina', 'Azahar, jazmín', 'Vainilla, almizcle, cedro', 'Floral, intensa y contemporánea.', 1],
    ['Yves Saint Laurent', 'La Nuit de L’Homme', 'hombre', 'diseñador', 100, 260000, 5, 4, 'amaderado especiado', 'Cardamomo', 'Lavanda, cedro', 'Vetiver, cumarina', 'Una fragancia nocturna, cálida y seductora.', 0],
    ['Jean Paul Gaultier', 'Le Male Eau de Toilette', 'hombre', 'diseñador', 125, 240000, 8, 4, 'aromático ambarado', 'Menta, lavanda', 'Canela, comino', 'Vainilla, sándalo, cedro', 'Un clásico masculino dulce, cálido y reconocible.', 1],
    ['Jean Paul Gaultier', 'Scandal Pour Homme', 'hombre', 'diseñador', 100, 250000, 5, 5, 'ambarado amaderado', 'Mandarina, salvia', 'Caramelo, haba tonka', 'Vetiver', 'Dulce, intenso y pensado para destacar.', 0],
    ['Jean Paul Gaultier', 'Classique Eau de Toilette', 'mujer', 'diseñador', 100, 235000, 5, 4, 'floral ambarado', 'Rosa, anís', 'Flor de azahar, jengibre', 'Vainilla, ámbar, sándalo', 'Un clásico femenino de personalidad marcada.', 0],
    ['Versace', 'Eros Eau de Toilette', 'hombre', 'diseñador', 100, 220000, 9, 5, 'aromático amaderado', 'Menta, manzana, limón', 'Haba tonka, ambroxán', 'Vainilla, cedro, musgo', 'Fresco, dulce y potente.', 1],
    ['Versace', 'Bright Crystal', 'mujer', 'diseñador', 90, 210000, 6, 3, 'floral afrutado', 'Yuzu, granada', 'Peonía, magnolia, loto', 'Ámbar, almizcle, caoba', 'Luminoso, floral y femenino.', 0],
    ['Versace', 'Dylan Blue', 'hombre', 'diseñador', 100, 225000, 6, 4, 'aromático acuático', 'Bergamota, pomelo', 'Pachulí, ambroxán', 'Azafrán, incienso, almizcle', 'Fresco y elegante con carácter mediterráneo.', 0],
    ['Rabanne', '1 Million Eau de Toilette', 'hombre', 'diseñador', 100, 235000, 5, 5, 'ambarado especiado', 'Pomelo, menta', 'Canela, rosa', 'Cuero, ámbar, pachulí', 'Intenso, dulce y llamativo.', 1],
    ['Rabanne', 'Phantom Eau de Toilette', 'hombre', 'diseñador', 100, 230000, 5, 4, 'aromático amaderado', 'Limón, lavanda', 'Manzana, humo', 'Vainilla, vetiver', 'Moderno, dulce y tecnológico.', 0],
    ['Rabanne', 'Lady Million', 'mujer', 'diseñador', 80, 250000, 5, 4, 'floral ambarado', 'Neroli, limón', 'Frambuesa, jazmín', 'Miel, ámbar, pachulí', 'Dulce, floral y sofisticado.', 1],
    ['Giorgio Armani', 'Acqua di Giò Eau de Toilette', 'hombre', 'diseñador', 100, 265000, 7, 4, 'acuático cítrico', 'Limón, bergamota', 'Romero, jazmín', 'Cedro, almizcle', 'Fresco y limpio, inspirado en el Mediterráneo.', 1],
    ['Giorgio Armani', 'My Way Eau de Parfum', 'mujer', 'diseñador', 90, 300000, 6, 4, 'floral ambarado', 'Flor de azahar, bergamota', 'Tuberosa, jazmín', 'Vainilla, cedro, almizcle', 'Floral elegante con una base cremosa.', 1],
    ['Giorgio Armani', 'Sì Eau de Parfum', 'mujer', 'diseñador', 100, 310000, 4, 4, 'floral frutal', 'Grosella negra', 'Rosa, fresia', 'Vainilla, pachulí, ambroxán', 'Elegante y envolvente con una firma moderna.', 0],
    ['Dolce & Gabbana', 'Light Blue Eau de Toilette', 'hombre', 'diseñador', 125, 205000, 7, 3, 'cítrico acuático', 'Limón, bergamota', 'Romero, palo de rosa', 'Almizcle, incienso, roble', 'Fresco, casual y mediterráneo.', 0],
    ['Dolce & Gabbana', 'The One Eau de Parfum', 'hombre', 'diseñador', 100, 245000, 5, 4, 'ambarado especiado', 'Pomelo, cilantro', 'Jengibre, cardamomo', 'Tabaco, ámbar, cedro', 'Cálido, elegante y nocturno.', 0],
    ['Givenchy', 'Gentleman Eau de Parfum', 'hombre', 'diseñador', 100, 260000, 4, 5, 'amaderado floral', 'Pimienta', 'Iris, bálsamo', 'Vainilla, pachulí, tolú', 'Un perfume elegante con iris y profundidad.', 0],
    ['Valentino', 'Born in Roma Uomo', 'hombre', 'diseñador', 100, 270000, 5, 4, 'amaderado aromático', 'Violeta, salvia', 'Jengibre', 'Vetiver, maderas', 'Contemporáneo, urbano y sofisticado.', 0],
    ['Valentino', 'Donna Born in Roma', 'mujer', 'diseñador', 100, 285000, 4, 4, 'floral ambarado', 'Grosella negra', 'Jazmín, té', 'Vainilla, madera de cachemira', 'Floral dulce con una base cálida.', 0],
    ['Creed', 'Aventus', 'hombre', 'nicho', 100, 620000, 3, 5, 'frutal ahumado y amaderado', 'Piña, bergamota, manzana', 'Abedul, jazmín, pachulí', 'Almizcle, musgo de roble, vainilla', 'Una referencia de nicho con gran presencia y estela.', 1],
    ['Creed', 'Aventus For Her', 'mujer', 'nicho', 75, 590000, 4, 4, 'frutal floral', 'Manzana, bergamota, pimienta rosa', 'Rosa, sándalo', 'Almizcle, ámbar, pachulí', 'Femenino, elegante y sofisticado.', 0],
    ['Xerjoff', 'Naxos', 'unisex', 'nicho', 100, 610000, 4, 5, 'ambarado aromático', 'Limón, bergamota, lavanda', 'Canela, miel, jazmín', 'Tabaco, vainilla, haba tonka', 'Una composición intensa, dulce y refinada.', 1],
    ['Montale', 'Arabians Tonka', 'unisex', 'nicho', 100, 495000, 5, 5, 'ambarado especiado', 'Azafrán, cardamomo', 'Rosa, oud', 'Haba tonka, caña de azúcar, ámbar, almizcle', 'Potente, dulce y de gran duración.', 1]
];

async function seed_database(database) {
    const rows = products.map((product, index) => {
        const [brand, name, gender, category, size_ml, price, stock, intensity, family, top_notes, heart_notes, base_notes, description, featured] = product;
        return { brand, name, gender, category, size_ml, price, stock, intensity, family, top_notes, heart_notes, base_notes, description, image_url: image_urls[index % image_urls.length], featured: Boolean(featured) };
    });
    const products_result = await database.from('products').upsert(rows, { onConflict: 'brand,name', ignoreDuplicates: true });
    if (products_result.error) throw products_result.error;
    const admin_email = (process.env.ADMIN_EMAIL || 'admin@dreamsperfumes.com').toLowerCase();
    const admin_password = process.env.ADMIN_PASSWORD;
    if (!admin_password) return;
    const users_result = await database.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (users_result.error) throw users_result.error;
    let admin = users_result.data.users.find((user) => user.email?.toLowerCase() === admin_email);
    if (!admin) {
        const create_result = await database.auth.admin.createUser({ email: admin_email, password: admin_password, email_confirm: true });
        if (create_result.error) throw create_result.error;
        admin = create_result.data.user;
    }
    const profile_result = await database.from('profiles').upsert({ id: admin.id, name: process.env.ADMIN_NAME || 'Administrador DREAMS', role: 'admin' }, { onConflict: 'id' });
    if (profile_result.error) throw profile_result.error;
}

module.exports = { seed_database };
