# Guía para practicar la defensa

Material de estudio; no demuestra que los integrantes ya comprendan o puedan defender el código. Cada uno debe tener su copia de documentación y practicar sin IA.

1. Dibujar navegador → Pages → Worker privado → Express → Supabase. Ubicar HTML/CSS/JS, proxy, SDK, cookies, RLS y clave exclusivamente servidor. Explicar por qué el 200 de la oficial restaurada no prueba el candidato.
2. Seguir registro normal desde `public/js/cuenta.js` a `server/customer-registration.js`: validación, rate limiting, signUp, perfil customer y sesión real. Explicar por qué no se inventa una sesión si Supabase no devuelve una.
3. En `server/app.js`, explicar contexto por aplicación e instaladores ordenados. Identificar guard de origen, restauración de sesión y guard de rol. Cambiar localmente una validación y demostrar su test.
4. Editar un producto de prueba: distinguir preview de imagen, escritura, lectura posterior de todos los campos y mensaje de éxito. Simular fallo de red posterior y explicar por qué no repetir un alta automáticamente.
5. Explicar `marca` real vs `brand` HTTP. Mostrar esquema, claves, relaciones y diferencia entre constraints y RLS. Explicar que PostgreSQL no es SQLite y que el usuario confirmó la aceptación docente de Supabase; distinguir esa declaración de un documento docente adjunto.
6. Dibujar el cambio de cuenta A→B del carrito. Explicar UUID, revisión, operation_id, merge de visitante e idempotencia. Mostrar por qué el precio se calcula en servidor.
7. Demostrar autoría de opinión y rechazo de borrado ajeno por API. Explicar por qué ocultar un botón no protege una ruta.
8. Checkout académico: tarjeta ficticia sólo navegador, ticket/receipt firmados y referencia estable. Distinguir simulación de un cobro y de una orden comercial. WhatsApp sólo abre un enlace con resumen.
9. Explicar semántica HTML, labels, foco, responsive y carrusel manual. Navegar con Tab/Enter/Flechas, desactivar JS y revisar contenido disponible.
10. Extraer ZIP, instalar con lockfile, ejecutar checks/tests/build sin `.git`. Localizar inventario40 y mostrar cómo falla una función de41 líneas con comentarios. Explicar limitaciones de la medición de programa principal.

Ejercicios individuales: localizar y corregir una URL HTTP inválida; agregar un caso límite de stock; explicar un 401 frente a un 403; restaurar un cambio local mediante Git; leer un test sin ejecutarlo y predecir su resultado; detectar una interpolación HTML insegura y usar escape. Registrar qué resolvió cada integrante, sólo después de hacerlo.

No memorizar una promesa de cumplimiento: llevar la matriz con pendientes reales, pruebas y rollback. No exponer contraseñas, headers, tokens o datos personales al proyectar la pantalla.
