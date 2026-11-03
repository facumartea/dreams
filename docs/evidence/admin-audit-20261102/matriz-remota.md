# Matriz remota final por caso

92 registros históricos, 89 casos distintos; último resultado de cada ID:89 PASS,0 FAIL. Se conservan el fallo original de stock:null y su corrección en el JSON. No sumar281 assertions privadas como casos distintos. Locales separados: matriz histórica201 (A28/B25/C25/D27/E30/F24), D25 de persistencia, DR12/FR25 y30 regresiones de tipos; suite476PASS.

| Caso | Precondiciones | Esperado | Resultado real | Estado |
|---|---|---|---|---|
| BASE-PREEXIST | cuenta Admin existente; recursos exclusivos QA | ningún producto con marca/nombre QA antes de alta | 0 | PASS |
| BASE-GUARD | cuenta Admin existente; recursos exclusivos QA | reproducir bloqueo del backend antiguo | {"method": "POST", "path": "/api/admin/products", "status": 403, "code": null, "guard_message": true} | PASS |
| BASE-NO-DUPLICATE | cuenta Admin existente; recursos exclusivos QA | ningún alta completada tras respuesta403 | 0 | PASS |
| BASE-CONFIG | cuenta Admin existente; recursos exclusivos QA | configuración efectiva identificada | {"preview_read_only": true, "admin_writes_enabled": false} | PASS |
| SOURCE-admin-script | cuenta Admin existente; recursos exclusivos QA | JS autenticado servido coincide exactamente con el código revisado | {"sha256": "82142cca2c6a6671394e0bc08ff367d7efa4ba664a06b8ef619b4e9e080900b0"} | PASS |
| NAV-productos | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-baja | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-usuarios | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-consultas | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-opiniones | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-pedidos | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-cupones | cuenta Admin existente; recursos exclusivos QA | módulo real carga y única tarjeta activa | verificado | PASS |
| NAV-keyboard | cuenta Admin existente; recursos exclusivos QA | activar módulo por Enter conserva foco útil | verificado | PASS |
| NAV-dashboard-retry | cuenta Admin existente; recursos exclusivos QA | error de conteos muestra reintento y recupera API real | verificado | PASS |
| NAV-module-retry | cuenta Admin existente; recursos exclusivos QA | error de módulo se recupera sin elevar permisos | verificado | PASS |
| IMG-invalid | cuenta Admin existente; recursos exclusivos QA | URL inválida bloquea Guardar | verificado | PASS |
| IMG-http | cuenta Admin existente; recursos exclusivos QA | HTTP inseguro rechazado | verificado | PASS |
| IMG-html | cuenta Admin existente; recursos exclusivos QA | respuesta HTML no se valida como imagen (fallo inyectado) | verificado | PASS |
| IMG-no-extension | cuenta Admin existente; recursos exclusivos QA | HTTPS sin extensión admite respuesta imagen en navegador (respuesta controlada) | verificado | PASS |
| IMG-timeout-retry | cuenta Admin existente; recursos exclusivos QA | timeout falla cerrado y Reintentar carga el asset real | verificado | PASS |
| IMG-late-response | cuenta Admin existente; recursos exclusivos QA | respuesta vieja no habilita una URL nueva inválida | verificado | PASS |
| IMG-expiring | cuenta Admin existente; recursos exclusivos QA | URL firmada advierte vencimiento (respuesta controlada) | verificado | PASS |
| PROD-create | cuenta Admin existente; recursos exclusivos QA | alta QA real y lectura persistida | {"qa_id": 219} | PASS |
| PROD-create-second | cuenta Admin existente; recursos exclusivos QA | segundo producto exclusivamente QA para cambio de edición | {"qa_id": 220} | PASS |
| SEARCH-name-accent | cuenta Admin existente; recursos exclusivos QA | nombre parcial con tildes y espacios por Enter | verificado | PASS |
| SEARCH-brand-button | cuenta Admin existente; recursos exclusivos QA | marca parcial y botón Buscar cubren catálogo completo | verificado | PASS |
| SEARCH-empty-clear | cuenta Admin existente; recursos exclusivos QA | búsqueda vacía y Limpiar vuelven al total | verificado | PASS |
| PROD-edit-every-field | cuenta Admin existente; recursos exclusivos QA | todos los campos persistidos y sin mezclar otro ID | verificado | PASS |
| SEARCH-retained | cuenta Admin existente; recursos exclusivos QA | guardar conserva filtro aplicado | verificado | PASS |
| PROD-image-kept | cuenta Admin existente; recursos exclusivos QA | editar precio conserva imagen después de recarga | verificado | PASS |
| PROD-public-reflection | cuenta Admin existente; recursos exclusivos QA | catálogo y detalle leen precio/imagen confirmados | verificado | PASS |
| PROD-images-rendered | cuenta Admin existente; recursos exclusivos QA | imagen guardada se ve realmente en catálogo y detalle | verificado | PASS |
| PROD-featured-home | cuenta Admin existente; recursos exclusivos QA | destacado guardado aparece realmente en Inicio | verificado | PASS |
| COUNTS-products-low | cuenta Admin existente; recursos exclusivos QA | tarjetas coinciden con listado real y stock bajo 0/1/2 | verificado | PASS |
| PROD-dirty-cancel | cuenta Admin existente; recursos exclusivos QA | cancelar confirmación conserva cambios; aceptar limpia ID | verificado | PASS |
| STOCK-0 | cuenta Admin existente; recursos exclusivos QA | baja incluye 0/1/2 y excluye3, con persistencia | verificado | PASS |
| STOCK-1 | cuenta Admin existente; recursos exclusivos QA | baja incluye 0/1/2 y excluye3, con persistencia | verificado | PASS |
| STOCK-2 | cuenta Admin existente; recursos exclusivos QA | baja incluye 0/1/2 y excluye3, con persistencia | verificado | PASS |
| STOCK-3 | cuenta Admin existente; recursos exclusivos QA | baja incluye 0/1/2 y excluye3, con persistencia | verificado | PASS |
| PROD-equal-buttons | cuenta Admin existente; recursos exclusivos QA | Editar y Eliminar con iguales dimensiones | {"width": 104, "height": 44} | PASS |
| PROD-double-submit | cuenta Admin existente; recursos exclusivos QA | doble clic en Guardar emite sólo un PUT | verificado | PASS |
| PROD-before-network-failure | cuenta Admin existente; recursos exclusivos QA | fallo de red antes de PUT conserva borrador y no anuncia éxito | verificado | PASS |
| API-stock-null | cuenta Admin existente; recursos exclusivos QA | JSON null debe rechazarse400 sin convertirse en stock0 | {"status": 400, "stock": 3} | PASS |
| API-stock-null-restored | cuenta Admin existente; recursos exclusivos QA | restaurar exclusivamente el producto QA al estado anterior | {"qa_id": 219, "stock": 3} | PASS |
| CLEAN-ADMIN-SESSION | cuenta Admin existente; recursos exclusivos QA | logout de la sesión QA, sin afectar otras sesiones Admin | 200 | PASS |
| PUB-legacy-compatible | cuenta Admin existente; recursos exclusivos QA | formato firmado del verificador legacy sigue siendo aceptado por la oficial | verificado | PASS |
| PUB-register-normal | cuenta Admin existente; recursos exclusivos QA | registro web normal sin confirmación, un POST ante doble clic y sesión inmediata | verificado | PASS |
| PUB-session-reload | cuenta Admin existente; recursos exclusivos QA | recarga y navegación conservan sesión | verificado | PASS |
| PUB-secure-refresh | cuenta Admin existente; recursos exclusivos QA | cookies seguras y renovación real de sesión | verificado | PASS |
| PUB-customer-denied | cuenta Admin existente; recursos exclusivos QA | customer no puede abrir Admin | verificado | PASS |
| PUB-logout-login | cuenta Admin existente; recursos exclusivos QA | logout y login real funcionan | verificado | PASS |
| PUB-wrong-password | cuenta Admin existente; recursos exclusivos QA | contraseña incorrecta da error recuperable | verificado | PASS |
| PUB-network-retry | cuenta Admin existente; recursos exclusivos QA | fallo de red de login conserva formulario y habilita reintento | verificado | PASS |
| PUB-cart-persist | cuenta Admin existente; recursos exclusivos QA | carrito por cuenta se guarda tras recarga | verificado | PASS |
| PUB-whatsapp | cuenta Admin existente; recursos exclusivos QA | destinatario y resumen correctos sin enviar mensajes | verificado | PASS |
| PUB-checkout | cuenta Admin existente; recursos exclusivos QA | checkout académico completo, referencia estable y doble envío protegido | verificado | PASS |
| PUB-cart-cleaned | cuenta Admin existente; recursos exclusivos QA | simulación consumió sólo el carrito QA | verificado | PASS |
| PUB-responsive-390 | cuenta Admin existente; recursos exclusivos QA | portada estática y carrusel accesible sin overflow | verificado | PASS |
| PUB-responsive-1440 | cuenta Admin existente; recursos exclusivos QA | portada estática y carrusel accesible sin overflow | verificado | PASS |
| PUB-anonymous-admin | cuenta Admin existente; recursos exclusivos QA | visitante rechazado después de publicación | verificado | PASS |
| PROD-readback-discrepancy | cuenta Admin existente; recursos exclusivos QA | HTTP200 discrepante no anuncia guardado (respuesta interceptada) | verificado | PASS |
| PROD-cross-record-pending | cuenta Admin existente; recursos exclusivos QA | respuesta demorada no permite mezclar otro producto | verificado | PASS |
| PROD-unfeature | cuenta Admin existente; recursos exclusivos QA | quitar destacado persiste y actualiza catálogo | verificado | PASS |
| PROD-lost-create-retry | cuenta Admin existente; recursos exclusivos QA | respuesta de POST perdida se recupera sin duplicar ni emitir otro POST | {"one_post": true, "qa_id": 225} | PASS |
| COUPON-create | cuenta Admin existente; recursos exclusivos QA | alta inactiva con código normalizado y contenido persistido | verificado | PASS |
| COUPON-edit | cuenta Admin existente; recursos exclusivos QA | edición conserva ID y confirma porcentaje tras recarga | verificado | PASS |
| COUPON-toggle | cuenta Admin existente; recursos exclusivos QA | Activar y Desactivar guardan estado real | verificado | PASS |
| COUPON-clear | cuenta Admin existente; recursos exclusivos QA | Limpiar sale de edición sin otro envío | verificado | PASS |
| COUPON-delete-confirm | cuenta Admin existente; recursos exclusivos QA | cancelar conserva; aceptar elimina y confirma ausencia | verificado | PASS |
| SEC-roles-rejected | cuenta Admin existente; recursos exclusivos QA | el registro rechaza campos de rol antes de crear sesión | verificado | PASS |
| SEC-normal-customer | cuenta Admin existente; recursos exclusivos QA | registro normal crea customer con sesión y sin privilegios Admin | verificado | PASS |
| SEC-customer--admin | cuenta Admin existente; recursos exclusivos QA | customer no accede Admin | verificado | PASS |
| SEC-customer--api-admin-products | cuenta Admin existente; recursos exclusivos QA | customer no accede Admin | verificado | PASS |
| SEC-customer--api-admin-users | cuenta Admin existente; recursos exclusivos QA | customer no accede Admin | verificado | PASS |
| SEC-customer-write | cuenta Admin existente; recursos exclusivos QA | customer no puede crear productos ni editar roles | verificado | PASS |
| SEC-origin | cuenta Admin existente; recursos exclusivos QA | origen ajeno rechazado aunque la sesión Admin sea válida | verificado | PASS |
| REVIEW-create-customer | cuenta Admin existente; recursos exclusivos QA | opinión ligada a customer normal para moderación exclusiva QA | verificado | PASS |
| REVIEW-search | cuenta Admin existente; recursos exclusivos QA | buscador de opiniones filtra por comentario | verificado | PASS |
| REVIEW-edit | cuenta Admin existente; recursos exclusivos QA | guardar confirma rating y comentario persistidos | verificado | PASS |
| REVIEW-delete | cuenta Admin existente; recursos exclusivos QA | confirmación de borrado verifica ausencia real | verificado | PASS |
| RESP-390 | cuenta Admin existente; recursos exclusivos QA | móvil/escritorio: controles accesibles, tabla desplazable sin overflow de página | verificado | PASS |
| RESP-1440 | cuenta Admin existente; recursos exclusivos QA | móvil/escritorio: controles accesibles, tabla desplazable sin overflow de página | verificado | PASS |
| PROD-delete-cancel | cuenta Admin existente; recursos exclusivos QA | cancelar borrado conserva producto QA | verificado | PASS |
| PROD-delete-edited | cuenta Admin existente; recursos exclusivos QA | borrar producto editado limpia ID y confirma ausencia | verificado | PASS |
| CLEAN-commercial-unchanged | cuenta Admin existente; recursos exclusivos QA | productos/stock y pedidos comerciales sin cambios | verificado | PASS |
| FINAL-admin-create | cuenta Admin existente; recursos exclusivos QA | alta real después de retirar mecanismo y Secret QA | verificado | PASS |
| FINAL-admin-edit-image | cuenta Admin existente; recursos exclusivos QA | edición e imagen persistidas en backend final limpio | verificado | PASS |
| FINAL-admin-clean | cuenta Admin existente; recursos exclusivos QA | borrado exclusivo QA y ausencia confirmada | verificado | PASS |
| FINAL-admin-logout | cuenta Admin existente; recursos exclusivos QA | botón real Cerrar sesión revoca y retira acceso | verificado | PASS |

Las precondiciones genéricas del arnés indican Admin existente/recursos QA; PUB-* usa cliente normal o visitante según el caso. Los fallos de red/imagen y readback discrepante son inyecciones en el navegador sobre recursos QA; las escrituras y lecturas persistentes sí llegan a la oficial. No se prueban Safari físico ni una certificación WCAG completa.
