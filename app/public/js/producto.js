// muestra el detalle real del perfume y prepara las acciones de carrito y whatsapp.
async function cargar_detalle_del_perfume() {
    const params = new URLSearchParams(window.location.search);
    const product_id = Number(params.get('id'));
    const container = document.getElementById('product-detail');

    container.innerHTML = '<div class="detail-loading" aria-label="Cargando perfume"><div class="skeleton-card" aria-hidden="true"></div><div class="detail-loading-copy" aria-hidden="true"></div></div>';

    if (!product_id) {
        container.innerHTML = '<div class="empty-state"><h2>Perfume no encontrado.</h2></div>';
        return;
    }

    try {
        const response = await fetch(`/api/products/${product_id}`);
        const product = await response.json();

        if (!response.ok) {
            throw new Error(product.error);
        }

        actualizar_metadatos_del_perfume(product);
        await mostrar_detalle_del_perfume(product);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h2>${escapar_texto_html(error.message)}</h2><a class="button button-dark" href="/catalogo.html">Volver al catálogo</a></div>`;
    }
}

function actualizar_metadatos_del_perfume(product) {
    const name = String(product.name).trim(), brand = typeof product.brand === 'string' ? product.brand.trim() : '';
    const identity = brand && !name.toLocaleLowerCase('es').includes(brand.toLocaleLowerCase('es')) ? `${name} de ${brand}` : name;
    const title = `${identity} | DREAMS`;
    const detail = typeof product.description === 'string' ? product.description.trim().replace(/\s+/g, ' ') : '';
    const description = detail.length > 10 ? detail.slice(0, 200) : `${identity}. Conocé esta fragancia del catálogo de DREAMS.`;
    const canonical_url = `https://dreams-perfumes.pages.dev/producto.html?id=${encodeURIComponent(product.id)}`;
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.getElementById('canonical-url').href = canonical_url;
    for (const [key, value] of Object.entries({ title, description, url: canonical_url, image: new URL(elegir_url_de_imagen_segura(product.image_url), window.location.origin).href })) {
        const og = document.querySelector(`meta[property="og:${key}"]`), twitter = document.querySelector(`meta[name="twitter:${key}"]`);
        if (og) og.content = value;
        if (twitter) twitter.content = value;
    }
}

function crear_enlace_de_consulta_del_perfume(product, number) {
    const identity = [product.brand, product.name].filter(Boolean).join(' ');
    const size = product.size_ml ? ` de ${product.size_ml} ml` : '';
    return crear_enlace_de_whatsapp(number, `Hola DREAMS, quiero consultar por 1 × ${identity}${size}.\nPrecio: ${formatear_precio(product.price)}.`);
}
function crear_imagen_del_detalle(product) {
    return `<div class="detail-image"><img src="${escapar_texto_html(elegir_url_de_imagen_segura(product.image_url))}" alt="${escapar_texto_html([product.brand, product.name].filter(Boolean).join(' '))}"></div>`;
}
function crear_cabecera_del_detalle(product) {
    return `<p class="eyebrow">${escapar_texto_html(product.category)} · ${escapar_texto_html(product.gender)} · ${escapar_texto_html(product.size_ml)} ml</p>
        <h1>${escapar_texto_html(product.name)}</h1><p class="product-meta">${escapar_texto_html(product.brand)} · ${escapar_texto_html(product.family)}</p>
        <div class="detail-price">${formatear_precio(product.price)}</div><p class="detail-description">${escapar_texto_html(product.description)}</p>
        <div class="intensity" title="Intensidad ${escapar_texto_html(product.intensity)} de 5">${[1,2,3,4,5].map(number => `<span class="${number <= product.intensity ? 'active' : ''}"></span>`).join('')}</div>
        <p class="product-meta">Intensidad: ${escapar_texto_html(product.intensity)}/5 · Disponibilidad: ${product.stock > 0 ? escapar_texto_html(product.stock) + ' unidades' : 'Agotado'}</p>`;
}
function crear_acciones_del_detalle(product, href) {
    return `<div class="detail-actions"><button id="detail-add" class="button button-dark" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
        ${href ? `<a class="button" href="${escapar_texto_html(href)}" target="_blank" rel="noopener noreferrer" data-whatsapp-inquiry>Consultar por WhatsApp</a>` : '<p class="muted" role="status">WhatsApp no está disponible en este momento.</p>'}</div>`;
}
function crear_detalle_de_notas_aromaticas(product) {
    const steps = [['Salida','salida'],['Corazón','corazon'],['Fondo','fondo']];
    const notes = steps.map(([title,key], index) => `<li class="note-block scent-step"><span class="scent-step-index" aria-hidden="true">0${index + 1}</span><h3>${title}</h3><p>${escapar_texto_html(product.notes[key].join(' · '))}</p></li>`).join('');
    return `<section class="scent-trail" aria-labelledby="scent-trail-title"><div class="scent-trail-header"><div><p class="eyebrow">DREAMS Scent Trail</p><h2 id="scent-trail-title">La evolución de la fragancia</h2></div><p>De la primera impresión a la estela final, descubrí cómo se despliegan sus notas.</p></div><ol class="notes-grid" aria-label="Etapas olfativas">${notes}</ol></section>`;
}
function preparar_acciones_del_perfume(product) {
    document.getElementById('detail-add').addEventListener('click', () => agregar_perfume_al_carrito(product));
    document.querySelector('[data-whatsapp-inquiry]')?.addEventListener('click', () => {
        // el enlace nativo abre durante el gesto; la consulta registrada no debe bloquearlo.
        fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }), keepalive: true }).catch(() => {});
    });
}
async function mostrar_detalle_del_perfume(product) {
    const container = document.getElementById('product-detail');
    const config = await leer_configuracion_publica().catch(() => ({}));
    const href = crear_enlace_de_consulta_del_perfume(product, config.whatsapp_number);
    container.innerHTML = `<section class="detail-layout">${crear_imagen_del_detalle(product)}<div class="detail-info">${crear_cabecera_del_detalle(product)}${crear_acciones_del_detalle(product, href)}${crear_detalle_de_notas_aromaticas(product)}</div></section>`;
    preparar_imagen_alternativa(container.querySelector('.detail-image img')); preparar_acciones_del_perfume(product);
}

document.addEventListener('DOMContentLoaded', cargar_detalle_del_perfume);
