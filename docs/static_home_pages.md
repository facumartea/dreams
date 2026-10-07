# Portada estática en Pages

Fecha: 2026-10-07 (America/Buenos_Aires). Rama `codex/static-home-pages`, basada en PR34/8d80fdd. PR34, PR35 y PR36 siguen abiertas. Se reutiliza únicamente la composición/asset de PR36; no se integra su rama ni PR35. Base funcional coincide con el sitio Pages b3cd5f6: server, Worker, catálogo, carrito, checkout, Auth, dependencias y datos permanecen sin cambios.

## Destino verificado y aislamiento

Cuenta Cloudflare `9f3d7af60fcb0c2b4fff8570843588f9`, Pages `dreams-perfumes`, URL https://dreams-perfumes.pages.dev. Proyecto Direct Upload sin fuente Git automática, production_branch `codex/cloudflare-hosting-migration`. Deployment previo `ae2f7932-aefe-48b2-a9e9-8c3597b607f9`, fuente b3cd5f62523d15603078798baa9f31b633692d3f, SUCCESS. Service binding DREAMS→Worker dreams-perfumes en producción y preview; Worker activo f73d5087-ac19-4168-890b-6da3abb6b635 al 100%. El branch de deployment es un selector de entorno Pages, no un merge ni publicación automática de esa rama Git.

Para evitar publicar funcionalidades pendientes, build Pages empaqueta exclusivamente HTML de inicio, CSS y motion compartido con los efectos de hero retirados. El advanced-mode Worker mantiene la conexión DREAMS y sustituye sólo GET/HEAD de `/`, `/index.html`, `/css/style.css`, `/js/motion.js`. Las otras rutas/bodies/status de backend permanecen intactos. Conserva CSP/cookies/security headers, no sustituye errores/permisos por contenido visual y recalcula ETag/304/HEAD para la representación nueva; assets visuales con revalidación y CSS de portada con versión de URL. No contiene Secret ni nuevo cliente Supabase, ni requiere copiar/configurar credenciales. La API y demás HTML/JS siguen en el Worker vigente.

## Diseño

Se conserva el perfume WebP original y sus derivados, fondo negro, iluminación fija, textos, tipografía, colores, imagen/lettering en proporción 2:3, composición responsive y CTA DESCUBRIR PERFUMES. Foto con fondo integrado; no se utiliza una captura como asset.

No hay entrada, hover de botella, flotación, zoom, rotación, parallax, brillo animado ni botón de pausa. Se retiraron funciones y CSS del hero que ya no se usan; se conserva la animación/estados de componentes compartidos y los estados normales de botones/menús. El scroll normal de la página y la altura del header existente no son desplazamientos internos del producto.

## Evidencia antes de publicar

35 JS en check; 95/95 tests (92 de base + tres regresiones de la capa Pages), builds Pages/Workers y syntax del `_worker.js` correctos. No lint/tipos independientes configurados.

QA local con frontend interceptado sobre APIs Pages vigentes: seis tamaños (390/430/768/1024/1440/1920), imagen cargada/2:3, cero animaciones de producto, misma posición dentro del hero y brillo al esperar/hover/scroll/reduced, sin control de pausa y CTA visible. 390/1440: menú/Escape, búsqueda/marca/género/reset y carrito/agregar/cantidades/eliminar/vaciar/persistencia/contador/total. Sin pageerror ni respuestas API fallidas. No equivale a deployment remoto nuevo.

## Publicación y reversión

Publicación pendiente. Primero Direct Upload de prueba con branch `codex/static-home-pages`; revisar GET e identidad. Esa URL preview no está en APP_ORIGINS del backend: no cambiar allowlist ni simular Auth/quote desde ese origen. Para alias raíz autorizado, repetir el mismo bundle/commit con branch `codex/cloudflare-hosting-migration`, conservando configuración y bindings del proyecto. API oficial: POST `/accounts/{account}/pages/projects/dreams-perfumes/deployments` con multipart `_worker.js`, `_routes.json`, manifest vacío, SHA y branch explícitos; flujo existente de este proyecto, sin reconfigurar Git/DNS.

Antes de publicar se confirmó el deployment anterior SUCCESS y su URL inmutable https://ae2f7932.dreams-perfumes.pages.dev/ responde 200. Si la publicación presenta una regresión crítica, usar POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/ae2f7932-aefe-48b2-a9e9-8c3597b607f9/rollback`, endpoint oficial revisado. Luego verificar canonical_deployment, raíz, CSS, health y quote/carrito de lectura desde alias raíz. No borrar deployments ni cambiar DNS/Worker. Recuperación es de la capa Pages; no es un respaldo independiente de Supabase. Rollback no ejecutado porque aún no hay incidente.

No se cambian catálogo/carrito/checkout/Auth ni flags de pago. No migraciones/seeds/pedidos/cobros/correos ni operaciones comerciales. La animación de preview PR36 permanece aislada e intacta.
