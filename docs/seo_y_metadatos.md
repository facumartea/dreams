# SEO, redacción y enlaces compartidos de DREAMS

## Para explicar en la entrega académica

SEO significa optimizar una web para que los buscadores comprendan sus páginas públicas. No garantiza una posición ni una fecha de indexación. En DREAMS se trabaja con contenido real, enlaces descriptivos y direcciones oficiales estables.

- `title`: título breve de la pestaña y una señal para el resultado del buscador. Ejemplo: «Nosotros y contacto | DREAMS».
- `description`: resumen específico de esa página. El buscador puede elegir otro fragmento; no es una promesa de posicionamiento.
- `canonical`: URL absoluta preferida entre variantes de una página. En un perfume conserva su ID real; elimina parámetros ajenos. Inicio usa https://dreams-perfumes.pages.dev/.
- Open Graph: título, descripción e imagen que una plataforma puede usar al compartir un enlace. Se entrega en el HTML inicial, antes de ejecutar JavaScript. Incluye `og:title`, `description`, `type`, `url`, `image`, `image:alt`, `site_name` y `locale=es_AR`.
- `twitter:card`: complemento para plataformas compatibles; DREAMS usa `summary_large_image`.
- `robots`/`X-Robots-Tag`: indican si una respuesta debe indexarse. No reemplazan contraseñas, roles ni autorización.
- Sitemap: lista de URLs públicas canónicas reales. No incluye cuenta, carrito, checkout, Admin ni referencias privadas.

SEO, compartir enlaces y mantener perfiles sociales son tareas diferentes. Instagram no genera la misma tarjeta en todos sus espacios. No se creó ninguna cuenta ni se publicaron mensajes. Las plataformas pueden conservar caché de títulos e imágenes anteriores.

«App/web» describe aquí una aplicación web multipágina que funciona en el navegador. No se añadió manifiesto, service worker ni instalación PWA. Si el profesor exige instalación o una app nativa, ese alcance requiere aclaración.

## Guía breve de escritura

Usar español con voseo: «Ingresá», «Descubrí», «Revisá», «Elegí»; acciones comunes «Continuar» y «Cerrar sesión». Escribir mensajes breves, indicar la acción posible y evitar explicaciones de implementación para visitantes. Mantener tipografía, paleta y tono premium de DREAMS.

Un título principal coherente por página; subtítulos para bloques relacionados. CTA descriptiva: «Descubrir perfumes», «Ver perfumes», «Agregar al carrito». Conservar nombres propios de perfumes, marcas y servicios como WhatsApp. No añadir palabras clave repetidas, certificaciones, notas olfativas o promociones inventadas. No se usa `meta keywords`.

Los textos generales reutilizan la propuesta y los destinos reales del sitio. Los metadatos de producto usan nombre, marca, descripción e imagen públicos. Si no existe una descripción útil, se usa una frase factual con nombre y marca; no se completa la ficha comercial en la base. Auditoría:19 de46 descripciones públicas tienen diez caracteres o menos, varias «.». Es una deuda de contenido a revisar con fuentes del producto, sin rellenarla con afirmaciones inventadas.

## Auditoría comprobada antes de editar — 2026-10-20

Oficial: Pages82060492-8f22-4595-81a0-8cb7dc78d526, fuente cd71d12, rama PR49 con checkpoint documental6f9ed42. Backend inmutable d5df723d, fuente ec04a35. Inicio, catálogo, Nosotros y productos servían canónicas Railway. Robots/sitemap también apuntaban a ese hosting histórico. Los productos dependían de JavaScript para completar Open Graph y contenido; un ID inexistente devolvía HTML genérico200. La oficial heredaba `X-Robots-Tag:noindex` del backend académico.404 de rutas desconocidas ya respondía correctamente.

Nueva rama codex/official-seo-metadata desde6f9ed42, dependiente de PR49; diferencia respecto al código publicado sólo documentación/evidencia antes de comenzar. PR48/Auth pendiente y PR51/video/animaciones quedan excluidos. La experiencia cinematográfica se terminó primero y permanece en dreams-preview.pages.dev, c8439ac/ba6891f4; esta tarea no la despliega allí.

## Implementación

- Metadatos iniciales por página, `lang=es`, títulos/descripciones propios, canonical HTTPS oficial, Open Graph y Twitter. Charset/viewport conservados. No se modifican precios, nombres comerciales ni datos de contactos.
- Pages prepara metadatos y respaldo `noscript` de la ficha con datos públicos reales. El navegador conserva su ficha interactiva original; sin JavaScript hay nombre, marca, descripción, imagen y enlace al catálogo. El listado incorpora enlaces reales de categoría sinJS. No se promete un carrito sinJavaScript.
- Lecturas adicionales sólo GET a `/api/products` o `/api/products/ID` del mismo backend inmutable validado. ID decimal positivo, timeout5s, máximo1MiB catálogo/64KiB ficha y máximo1000 productos. No se reenvían cookies, Authorization ni Origin del visitante en esas consultas. No se siguen redirects ni se descargan URLs de imagen desde servidor. Texto escapado; URLs de imagen HTTPS o respaldo de marca. Sin secretos nuevos.
- Noindex y404 reales para productos faltantes/ID inválido;503 sin datos internos ante fallo/JSON inválido/excesivo. Errores no declaran canónicas hacia productos inexistentes. HEAD y ETag reflejan el contenido real.
- Sitemap dinámico: seis páginas/categorías públicas y IDs existentes; sin `lastmod` inventado ni parámetros sensibles. El archivo estático conserva las seis rutas públicas para otros modos de ejecución; la publicación Pages agrega el catálogo real.
- Sólo las páginas públicas válidas de la OFICIAL permiten indexación. Búsquedas/combinaciones de filtros, errores, cuenta, carrito, checkout, API y Admin permanecen noindex. Las variantes de filtros conservan canonical de catálogo/categoría. El backend `PREVIEW_READ_ONLY` no cambia.
- Todo origen de validación distinto del oficial recibe noindex; robots de preview prohíbe todo. Robots oficial bloquea API/Admin y permite que el rastreador lea noindex de las pantallas públicas privadas. Acceso Admin/API sigue protegido por servidor.
- Se conservan cabeceras de seguridad, cookies múltiples, caché privada/no-store, errores del backend y métodos de mutación. No se cambian CSP, Auth, roles, DNS, secretos ni datos comerciales.
- Sin JSON-LD en esta tanda: no se declaran ofertas, reseñas ni puntuaciones que el flujo académico no respalda. Open Graph `website` describe la página de ficha; no implica un pago comercial habilitado.

## Imagen para compartir

`public/assets/dreams-social.png`:1200×630, composición de texto DREAMS y la fotografía oficial `dreams-hero-1024.webp` sin deformarla ni regenerarla. Negro/dorado/marfil y tipografía del sitio. Fuente revisable `templates/social-card.html`, rasterizada desde una composición HTML; no se usa el video ni material de preview. La foto original tiene1024×1536 y se muestra420×630; no se presenta un aumento de resolución como detalle recuperado. Assets existentes en repositorio; no se presume una licencia externa adicional.

La imagen social de un producto usa su enlace real. No se rechazan enlaces sólo por no terminar en.jpg/png. El servidor no ejecuta HEAD ni descarga destinos arbitrarios. Las46 URLs actuales son HTTPS; que el origen sea HTTPS no garantiza que el proveedor mantenga el archivo o su permiso de uso.

## Redes: confirmado y propuesto

El usuario confirmó que todavía no existen perfiles oficiales de Instagram ni Facebook. Quedan pendientes como recursos futuros, sin usuarios inventados ni enlaces vacíos; esto no impide preparar Open Graph para compartir en esas plataformas. Se conserva WhatsApp542944160065 y ambos teléfonos/correos existentes. No se conectan Search Console, analítica ni píxeles.

Propuesta académica de biografía, NO publicada: «DREAMS · Perfumería multimarca. Descubrí perfumes de diseñador y nicho. Explorá nuestro catálogo ↓».

Propuesta de descripción, NO publicada: «DREAMS es una perfumería multimarca digital para explorar fragancias de mujer, hombre y unisex y encontrar opciones en su catálogo».

## Validación y estado

VALIDACIÓN AISLADA COMPLETADA. Fuente de código1d864688ca4f5c365513c7c53f9d828ab5a7360f, PR52 dependientePR49. CI39454098983 SUCCESS144tests/check52/audit/builds;47 pruebas focalizadas finales PASS. Pages1eb4c3d8-a24a-4426-aac4-8cb0b46f1049 SUCCESS/preview, https://1eb4c3d8.dreams-perfumes.pages.dev/. Oficial todavía82060492/cd71d12. Helpers nuevos/modificados <=20líneas comprobados por AST. Se verificó transporte HTTPS y puerto exacto del backend incluso al entrar por HTTP local. Primer harness Node conservaba Content-Encoding después de descomprimir; se corrigió sólo en el transporte local de QA. QA local compilada y remota aislada390/1440: metadatos iniciales reales, menú/filtros/ficha/acceso sin erroresJS/overflow; producto y46 enlaces de catálogo sinJS PASS. Carrito/quote/persistencia local contra API pública real PASS; la preview aislada conserva bloqueo de Origin en mutaciones y no se declara checkout/login autenticado probado allí. AuditoríaHTTP: siete páginas/categorías públicas con OG/canonical oficiales, privadas noindex/Admin403, productos faltantes/404reales y sitemap52URLs únicas PASS. PNG social1200×630 público200 con bytes idénticos; imagen real de producto GET parcial206/image/jpeg sin sesión. Nu HTML Checker oficial sobre ficha199 devolvió messages:[]; no equivale a tarjeta vista en apps. Artefacto530955bytes SHA256a68f758060dd7f5e31e114d0218b4cc9e4b155228847c7911e5de6eb6d03058a, sin marcadores de secretos/video. Próximo: publicar mismo artefacto únicamente en la oficial autorizada y repetir HTTP/flujo visitante. HTML comprobado no equivale a una tarjeta efectivamente observada dentro de WhatsApp/Facebook. El depurador oficial de Facebook puede requerir una cuenta autorizada; no se presume acceso. Safari/iPhone físico y sesiones autenticadas dependen de herramientas/credenciales disponibles; no se atribuyen a fixtures.

## Publicación y rollback

Build `pnpm run build:pages`; proyecto exacto dreams-perfumes, cuenta9f3d7af60fcb0c2b4fff8570843588f9. Primero Direct Upload en branch de validación distinta de production_branch: alias aislado noindex, sin cambiar canonical oficial. Después, sólo con checks y QA satisfactorios, publicar mismo artefacto con etiqueta técnica de branch oficial y SHA Git real. No se modifica backend ni `APP_ORIGINS`.

Rollback disponible a Pages82060492-8f22-4595-81a0-8cb7dc78d526 por POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/82060492-8f22-4595-81a0-8cb7dc78d526/rollback`; comprobar canonical_deployment, inicio estático, catálogo, carrito y Auth. Recupera también la política noindex/metadatos previos de esa versión. No hay configuración de Auth/DB que revertir en esta tarea; conservar ambos deployments. No ejecutar rollback preventivamente ni eliminar despliegues.
