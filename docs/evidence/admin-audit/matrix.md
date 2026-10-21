# Matriz Admin — 2026-10-21

Todos los casos siguientes son locales: Node/HTTP con BD inyectada o Chromium con fixtures. No prueban acceso Admin real en Supabase. No hubo escrituras comerciales. Datos: catálogo fixture de 46 productos con nombres acentuados, stock 0/1/2/3/nulo; perfiles Admin/customer exclusivamente locales y cupones fixture.

Ejecuciones: {'PASS': 201}. Casos distintos por área: {'A': 28, 'B': 25, 'C': 25, 'D': 27, 'E': 30, 'F': 24}. Un mismo ID en escritorio y móvil cuenta una vez para el mínimo por área. Los 107 casos Node forman parte de la suite de 279, no se suman como otra suite. Browser reutiliza PR46 seleccionada y ampliada; ejecución sobre esta rama.

| ID | Objetivo | Entorno | Esperado | Real | Estado |
|---|---|---|---|---|---|
| B01 | parcial nombre | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B02 | parcial marca | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B03 | mayúsculas nombre | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B04 | marca minúsculas | Node/HTTP local con fixtures, sin Supabase remoto | [2] | [2] | PASS |
| B05 | tildes nombre | Node/HTTP local con fixtures, sin Supabase remoto | [2] | [2] | PASS |
| B06 | tildes consulta | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B07 | espacios exteriores | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B08 | vacío | Node/HTTP local con fixtures, sin Supabase remoto | [1,2,3,4] | [1,2,3,4] | PASS |
| B09 | sólo espacios | Node/HTTP local con fixtures, sin Supabase remoto | [1,2,3,4] | [1,2,3,4] | PASS |
| B10 | sin resultados | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B11 | marca ausente | Node/HTTP local con fixtures, sin Supabase remoto | [3] | [3] | PASS |
| B12 | campo familia excluido | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B13 | categoría excluida | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B14 | ID excluido | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B15 | texto hostil literal | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B16 | Unicode descompuesto | Node/HTTP local con fixtures, sin Supabase remoto | [2] | [2] | PASS |
| B17 | substring central | Node/HTTP local con fixtures, sin Supabase remoto | [1] | [1] | PASS |
| B18 | marca con tilde | Node/HTTP local con fixtures, sin Supabase remoto | [2] | [2] | PASS |
| B19 | nombre null no falla | Node/HTTP local con fixtures, sin Supabase remoto | [] | [] | PASS |
| B20 | sin reordenar | Node/HTTP local con fixtures, sin Supabase remoto | [1,2,3] | [1,2,3] | PASS |
| B21 | busca más allá de una primera página | Node/HTTP local con fixtures, sin Supabase remoto | ID99 encontrado | ID99 encontrado | PASS |
| C01 | clasificación de stock 0 | Node/HTTP local con fixtures, sin Supabase remoto | true / Sin stock | true / Sin stock | PASS |
| C02 | clasificación de stock 1 | Node/HTTP local con fixtures, sin Supabase remoto | true / Stock bajo | true / Stock bajo | PASS |
| C03 | clasificación de stock 2 | Node/HTTP local con fixtures, sin Supabase remoto | true / Stock bajo | true / Stock bajo | PASS |
| C04 | clasificación de stock 3 | Node/HTTP local con fixtures, sin Supabase remoto | false / Disponible | false / Disponible | PASS |
| C05 | clasificación de stock 99 | Node/HTTP local con fixtures, sin Supabase remoto | false / Disponible | false / Disponible | PASS |
| C06 | clasificación de stock null | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C07 | clasificación de stock undefined | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C08 | clasificación de stock  | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C09 | clasificación de stock 2 | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C10 | clasificación de stock NaN | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C11 | clasificación de stock Infinity | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C12 | clasificación de stock -1 | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C13 | clasificación de stock 1.5 | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C14 | clasificación de stock [object Object] | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C15 | clasificación de stock  | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C16 | clasificación de stock true | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C17 | clasificación de stock false | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C18 | clasificación de stock 9007199254740992 | Node/HTTP local con fixtures, sin Supabase remoto | false / Stock no válido | false / Stock no válido | PASS |
| C19 | baja y búsqueda combinadas | Node/HTTP local con fixtures, sin Supabase remoto | sólo2 | sólo2 | PASS |
| C20 | baja incluye0/2 y descarta3/null | Node/HTTP local con fixtures, sin Supabase remoto | 1,2 | 1,2 | PASS |
| C21 | vuelta a listado completo | Node/HTTP local con fixtures, sin Supabase remoto | cuatro filas | cuatro filas | PASS |
| E01 | HTTPS con extensión | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E02 | HTTPS sin extensión | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E03 | ruta local | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E04 | vacío | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E05 | espacios | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E06 | HTTP | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E07 | javascript | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E08 | data | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E09 | relativa insegura | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E10 | credenciales | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E11 | página Google | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E12 | Google imgres | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E13 | barra inversa | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E14 | control | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E15 | trim exterior | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E16 | FTP | Node/HTTP local con fixtures, sin Supabase remoto | false validación sintáctica | false validación sintáctica | PASS |
| E17 | query legítima | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E18 | hash | Node/HTTP local con fixtures, sin Supabase remoto | true validación sintáctica | true validación sintáctica | PASS |
| E19 | firma Supabase detectada | Node/HTTP local con fixtures, sin Supabase remoto | aviso temporal | aviso temporal | PASS |
| E20 | firma AWS detectada | Node/HTTP local con fixtures, sin Supabase remoto | aviso temporal | aviso temporal | PASS |
| E21 | firma GCP detectada | Node/HTTP local con fixtures, sin Supabase remoto | aviso temporal | aviso temporal | PASS |
| E22 | HTTPS permanente | Node/HTTP local con fixtures, sin Supabase remoto | sin aviso temporal | sin aviso temporal | PASS |
| D01 | nombre | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D02 | marca | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D03 | precio cero | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D04 | precio negativo | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D05 | precio decimal | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D06 | stock cero | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D07 | stock negativo | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D08 | stock decimal | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D09 | tamaño cero | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D10 | tamaño válido | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D11 | intensidad cero | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D12 | intensidad máxima | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D13 | imagen trim | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D14 | imagen HTTP | Node/HTTP local con fixtures, sin Supabase remoto | 400 y persistencia sólo si válido | 400 y persistencia sólo si válido | PASS |
| D15 | destacado true | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D16 | destacado false | Node/HTTP local con fixtures, sin Supabase remoto | 200 y persistencia sólo si válido | 200 y persistencia sólo si válido | PASS |
| D17 | customer no modifica | Node/HTTP local con fixtures, sin Supabase remoto | 403 | 403 | PASS |
| D18 | anónimo no modifica | Node/HTTP local con fixtures, sin Supabase remoto | 403 | 403 | PASS |
| D19 | origen ajeno no modifica | Node/HTTP local con fixtures, sin Supabase remoto | 403 | 403 | PASS |
| D20 | ID ausente no crea | Node/HTTP local con fixtures, sin Supabase remoto | 404 | 404 | PASS |
| D21 | preview conserva protección | Node/HTTP local con fixtures, sin Supabase remoto | 403 | 403 | PASS |
| D22 | editar precio conserva imagen | Node/HTTP local con fixtures, sin Supabase remoto | imagen idéntica | imagen idéntica | PASS |
| F01 | cupón normal | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F02 | cupón minúsculas | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F03 | cupón trim | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F04 | cupón vacío | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F05 | cupón corto | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F06 | cupón largo | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F07 | cupón caracter ilegal | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F08 | cupón porcentaje0 | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F09 | cupón porcentaje100 | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F10 | cupón mayor100 | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F11 | cupón negativo | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F12 | cupón NaN | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F13 | cupón infinito | Node/HTTP local con fixtures, sin Supabase remoto | inválido | inválido | PASS |
| F14 | cupón decimal | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F15 | cupón activo | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F16 | cupón inactivo | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F17 | cupón guion | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F18 | cupón underscore | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F19 | cupón número | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| F20 | cupón borde3 | Node/HTTP local con fixtures, sin Supabase remoto | válido | válido | PASS |
| C25 | Admin conserva stock null sin convertirlo en cero | Node/HTTP local con fixtures, sin Supabase remoto | null | null | PASS |
| A01 | isologo original limpio visible y sin deformación | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | isologo original limpio visible y sin deformación | Comprobado con assertions de DOM/red/API | PASS |
| A02 | frase técnica eliminada | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | frase técnica eliminada | Comprobado con assertions de DOM/red/API | PASS |
| A03 | siete tarjetas semánticas | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | siete tarjetas semánticas | Comprobado con assertions de DOM/red/API | PASS |
| A04 | sin navegación inferior duplicada | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | sin navegación inferior duplicada | Comprobado con assertions de DOM/red/API | PASS |
| A05 | tarjetas controlan módulos existentes | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjetas controlan módulos existentes | Comprobado con assertions de DOM/red/API | PASS |
| A06 | tarjeta abre Productos | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Productos | Comprobado con assertions de DOM/red/API | PASS |
| A07 | tarjeta abre Usuarios | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Usuarios | Comprobado con assertions de DOM/red/API | PASS |
| A08 | tarjeta abre Consultas | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Consultas | Comprobado con assertions de DOM/red/API | PASS |
| A09 | tarjeta abre Opiniones | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Opiniones | Comprobado con assertions de DOM/red/API | PASS |
| A10 | tarjeta abre Pedidos | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Pedidos | Comprobado con assertions de DOM/red/API | PASS |
| A11 | tarjeta abre Cupones | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta abre Cupones | Comprobado con assertions de DOM/red/API | PASS |
| A12 | tarjeta baja abre listado filtrado | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | tarjeta baja abre listado filtrado | Comprobado con assertions de DOM/red/API | PASS |
| A13 | una sola tarjeta activa y aria-pressed | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | una sola tarjeta activa y aria-pressed | Comprobado con assertions de DOM/red/API | PASS |
| A14 | Enter activa tarjeta | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | Enter activa tarjeta | Comprobado con assertions de DOM/red/API | PASS |
| A15 | Espacio activa tarjeta | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | Espacio activa tarjeta | Comprobado con assertions de DOM/red/API | PASS |
| A16 | foco vuelve al contenido al abrir módulo | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | foco vuelve al contenido al abrir módulo | Comprobado con assertions de DOM/red/API | PASS |
| A17 | conteos productos/baja coherentes | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | conteos productos/baja coherentes | Comprobado con assertions de DOM/red/API | PASS |
| A18 | conteo de Cupones real | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | conteo de Cupones real | Comprobado con assertions de DOM/red/API | PASS |
| A19 | foco de teclado visible | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | foco de teclado visible | Comprobado con assertions de DOM/red/API | PASS |
| A20 | fallo de módulo muestra reintento y recupera | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | fallo de módulo muestra reintento y recupera | Comprobado con assertions de DOM/red/API | PASS |
| A21 | respuesta atrasada no cambia módulo/foco actual | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | respuesta atrasada no cambia módulo/foco actual | Comprobado con assertions de DOM/red/API | PASS |
| A22 | áreas táctiles y sin scroll horizontal | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | áreas táctiles y sin scroll horizontal | Comprobado con assertions de DOM/red/API | PASS |
| B22 | escribir no aplica antes de Buscar/Enter | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | escribir no aplica antes de Buscar/Enter | Comprobado con assertions de DOM/red/API | PASS |
| B23 | Enter aplica nombre sin tildes | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | Enter aplica nombre sin tildes | Comprobado con assertions de DOM/red/API | PASS |
| B24 | Buscar aplica marca y Limpiar restaura con foco | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | Buscar aplica marca y Limpiar restaura con foco | Comprobado con assertions de DOM/red/API | PASS |
| B25 | sin resultados muestra mensaje y limpieza recupera | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | sin resultados muestra mensaje y limpieza recupera | Comprobado con assertions de DOM/red/API | PASS |
| C22 | sin stock y stock bajo diferenciados | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | sin stock y stock bajo diferenciados | Comprobado con assertions de DOM/red/API | PASS |
| C23 | combinar baja con búsqueda y conservar al editar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | combinar baja con búsqueda y conservar al editar | Comprobado con assertions de DOM/red/API | PASS |
| C24 | volver a todos conserva búsqueda y permite limpiar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | volver a todos conserva búsqueda y permite limpiar | Comprobado con assertions de DOM/red/API | PASS |
| D23 | cambiar producto descarta sólo con confirmación | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | cambiar producto descarta sólo con confirmación | Comprobado con assertions de DOM/red/API | PASS |
| E23 | vista previa local carga imagen real | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | vista previa local carga imagen real | Comprobado con assertions de DOM/red/API | PASS |
| E24 | URL HTTP bloquea guardar con mensaje claro | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | URL HTTP bloquea guardar con mensaje claro | Comprobado con assertions de DOM/red/API | PASS |
| E25 | HTTPS sin extensión valida sin HEAD | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | HTTPS sin extensión valida sin HEAD | Comprobado con assertions de DOM/red/API | PASS |
| E26 | página HTML no se guarda como imagen | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | página HTML no se guarda como imagen | Comprobado con assertions de DOM/red/API | PASS |
| E27 | 404 permite reintentar sin romper formulario | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | 404 permite reintentar sin romper formulario | Comprobado con assertions de DOM/red/API | PASS |
| E28 | URL vacía bloquea guardar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | URL vacía bloquea guardar | Comprobado con assertions de DOM/red/API | PASS |
| D24 | guardar precio conserva imagen y persiste al recargar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | guardar precio conserva imagen y persiste al recargar | Comprobado con assertions de DOM/red/API | PASS |
| D25 | doble envío ignorado y contexto bloqueado | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | doble envío ignorado y contexto bloqueado | Comprobado con assertions de DOM/red/API | PASS |
| D26 | fallo de red conserva datos y permite reintentar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | fallo de red conserva datos y permite reintentar | Comprobado con assertions de DOM/red/API | PASS |
| A23 | sin errores JavaScript ni overflow tras editar | Chromium desktop 1440x1000; Express/Auth/BD fixtures locales | sin errores JavaScript ni overflow tras editar | Comprobado con assertions de DOM/red/API | PASS |
| A01 | isologo original limpio visible y sin deformación | Chromium mobile 390x844; Express/Auth/BD fixtures locales | isologo original limpio visible y sin deformación | Comprobado con assertions de DOM/red/API | PASS |
| A02 | frase técnica eliminada | Chromium mobile 390x844; Express/Auth/BD fixtures locales | frase técnica eliminada | Comprobado con assertions de DOM/red/API | PASS |
| A03 | siete tarjetas semánticas | Chromium mobile 390x844; Express/Auth/BD fixtures locales | siete tarjetas semánticas | Comprobado con assertions de DOM/red/API | PASS |
| A04 | sin navegación inferior duplicada | Chromium mobile 390x844; Express/Auth/BD fixtures locales | sin navegación inferior duplicada | Comprobado con assertions de DOM/red/API | PASS |
| A05 | tarjetas controlan módulos existentes | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjetas controlan módulos existentes | Comprobado con assertions de DOM/red/API | PASS |
| A06 | tarjeta abre Productos | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Productos | Comprobado con assertions de DOM/red/API | PASS |
| A07 | tarjeta abre Usuarios | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Usuarios | Comprobado con assertions de DOM/red/API | PASS |
| A08 | tarjeta abre Consultas | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Consultas | Comprobado con assertions de DOM/red/API | PASS |
| A09 | tarjeta abre Opiniones | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Opiniones | Comprobado con assertions de DOM/red/API | PASS |
| A10 | tarjeta abre Pedidos | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Pedidos | Comprobado con assertions de DOM/red/API | PASS |
| A11 | tarjeta abre Cupones | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta abre Cupones | Comprobado con assertions de DOM/red/API | PASS |
| A12 | tarjeta baja abre listado filtrado | Chromium mobile 390x844; Express/Auth/BD fixtures locales | tarjeta baja abre listado filtrado | Comprobado con assertions de DOM/red/API | PASS |
| A13 | una sola tarjeta activa y aria-pressed | Chromium mobile 390x844; Express/Auth/BD fixtures locales | una sola tarjeta activa y aria-pressed | Comprobado con assertions de DOM/red/API | PASS |
| A14 | Enter activa tarjeta | Chromium mobile 390x844; Express/Auth/BD fixtures locales | Enter activa tarjeta | Comprobado con assertions de DOM/red/API | PASS |
| A15 | Espacio activa tarjeta | Chromium mobile 390x844; Express/Auth/BD fixtures locales | Espacio activa tarjeta | Comprobado con assertions de DOM/red/API | PASS |
| A16 | foco vuelve al contenido al abrir módulo | Chromium mobile 390x844; Express/Auth/BD fixtures locales | foco vuelve al contenido al abrir módulo | Comprobado con assertions de DOM/red/API | PASS |
| A17 | conteos productos/baja coherentes | Chromium mobile 390x844; Express/Auth/BD fixtures locales | conteos productos/baja coherentes | Comprobado con assertions de DOM/red/API | PASS |
| A18 | conteo de Cupones real | Chromium mobile 390x844; Express/Auth/BD fixtures locales | conteo de Cupones real | Comprobado con assertions de DOM/red/API | PASS |
| A19 | foco de teclado visible | Chromium mobile 390x844; Express/Auth/BD fixtures locales | foco de teclado visible | Comprobado con assertions de DOM/red/API | PASS |
| A20 | fallo de módulo muestra reintento y recupera | Chromium mobile 390x844; Express/Auth/BD fixtures locales | fallo de módulo muestra reintento y recupera | Comprobado con assertions de DOM/red/API | PASS |
| A21 | respuesta atrasada no cambia módulo/foco actual | Chromium mobile 390x844; Express/Auth/BD fixtures locales | respuesta atrasada no cambia módulo/foco actual | Comprobado con assertions de DOM/red/API | PASS |
| A22 | áreas táctiles y sin scroll horizontal | Chromium mobile 390x844; Express/Auth/BD fixtures locales | áreas táctiles y sin scroll horizontal | Comprobado con assertions de DOM/red/API | PASS |
| B22 | escribir no aplica antes de Buscar/Enter | Chromium mobile 390x844; Express/Auth/BD fixtures locales | escribir no aplica antes de Buscar/Enter | Comprobado con assertions de DOM/red/API | PASS |
| B23 | Enter aplica nombre sin tildes | Chromium mobile 390x844; Express/Auth/BD fixtures locales | Enter aplica nombre sin tildes | Comprobado con assertions de DOM/red/API | PASS |
| B24 | Buscar aplica marca y Limpiar restaura con foco | Chromium mobile 390x844; Express/Auth/BD fixtures locales | Buscar aplica marca y Limpiar restaura con foco | Comprobado con assertions de DOM/red/API | PASS |
| B25 | sin resultados muestra mensaje y limpieza recupera | Chromium mobile 390x844; Express/Auth/BD fixtures locales | sin resultados muestra mensaje y limpieza recupera | Comprobado con assertions de DOM/red/API | PASS |
| C22 | sin stock y stock bajo diferenciados | Chromium mobile 390x844; Express/Auth/BD fixtures locales | sin stock y stock bajo diferenciados | Comprobado con assertions de DOM/red/API | PASS |
| C23 | combinar baja con búsqueda y conservar al editar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | combinar baja con búsqueda y conservar al editar | Comprobado con assertions de DOM/red/API | PASS |
| C24 | volver a todos conserva búsqueda y permite limpiar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | volver a todos conserva búsqueda y permite limpiar | Comprobado con assertions de DOM/red/API | PASS |
| D23 | cambiar producto descarta sólo con confirmación | Chromium mobile 390x844; Express/Auth/BD fixtures locales | cambiar producto descarta sólo con confirmación | Comprobado con assertions de DOM/red/API | PASS |
| E23 | vista previa local carga imagen real | Chromium mobile 390x844; Express/Auth/BD fixtures locales | vista previa local carga imagen real | Comprobado con assertions de DOM/red/API | PASS |
| E24 | URL HTTP bloquea guardar con mensaje claro | Chromium mobile 390x844; Express/Auth/BD fixtures locales | URL HTTP bloquea guardar con mensaje claro | Comprobado con assertions de DOM/red/API | PASS |
| E25 | HTTPS sin extensión valida sin HEAD | Chromium mobile 390x844; Express/Auth/BD fixtures locales | HTTPS sin extensión valida sin HEAD | Comprobado con assertions de DOM/red/API | PASS |
| E26 | página HTML no se guarda como imagen | Chromium mobile 390x844; Express/Auth/BD fixtures locales | página HTML no se guarda como imagen | Comprobado con assertions de DOM/red/API | PASS |
| E27 | 404 permite reintentar sin romper formulario | Chromium mobile 390x844; Express/Auth/BD fixtures locales | 404 permite reintentar sin romper formulario | Comprobado con assertions de DOM/red/API | PASS |
| E28 | URL vacía bloquea guardar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | URL vacía bloquea guardar | Comprobado con assertions de DOM/red/API | PASS |
| D24 | guardar precio conserva imagen y persiste al recargar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | guardar precio conserva imagen y persiste al recargar | Comprobado con assertions de DOM/red/API | PASS |
| D25 | doble envío ignorado y contexto bloqueado | Chromium mobile 390x844; Express/Auth/BD fixtures locales | doble envío ignorado y contexto bloqueado | Comprobado con assertions de DOM/red/API | PASS |
| D26 | fallo de red conserva datos y permite reintentar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | fallo de red conserva datos y permite reintentar | Comprobado con assertions de DOM/red/API | PASS |
| A23 | sin errores JavaScript ni overflow tras editar | Chromium mobile 390x844; Express/Auth/BD fixtures locales | sin errores JavaScript ni overflow tras editar | Comprobado con assertions de DOM/red/API | PASS |
| A24 | tap en móvil conserva una sola selección y no deja hover pegado | Chromium touch móvil emulado390x844 | tap en móvil conserva una sola selección y no deja hover pegado | Comprobado en navegador | PASS |
| A25 | movimiento reducido sin transiciones de tarjetas | Chromium reduced-motion | movimiento reducido sin transiciones de tarjetas | Comprobado en navegador | PASS |
| E29 | respuesta vieja no valida ni reemplaza una URL nueva | Chromium imágenes interceptadas fixture | respuesta vieja no valida ni reemplaza una URL nueva | Comprobado en navegador | PASS |
| E30 | enlace temporal válido advierte sin modificarlo | Chromium URL firmada ficticia | enlace temporal válido advierte sin modificarlo | Comprobado en navegador | PASS |
| A26 | hover de escritorio cambia fondo con contraste | Chromium mouse escritorio | hover de escritorio cambia fondo con contraste | Comprobado en navegador | PASS |
| A27 | Editar/Eliminar con ancho/alto/padding/alineación iguales y mínimo44px; destructivo distinto | Chromium desktop 1440x900 | 104x44 y estilo destructivo distinguible | 104x44 ambos | PASS |
| D27 | confirmación de borrado conservada, cancelar no envía DELETE; foco y sin overflow | Chromium desktop | 0 DELETE, foco visible y ancho de documento estable | comprobado | PASS |
| A27 | Editar/Eliminar con ancho/alto/padding/alineación iguales y mínimo44px; destructivo distinto | Chromium mobile 390x844 | 104x44 y estilo destructivo distinguible | 104x44 ambos | PASS |
| D27 | confirmación de borrado conservada, cancelar no envía DELETE; foco y sin overflow | Chromium mobile | 0 DELETE, foco visible y ancho de documento estable | comprobado | PASS |
| F21 | crear cupón actualiza listado y conteo real de tarjeta | Chromium escritorio, servidor/BD fixtures locales | crear cupón actualiza listado y conteo real de tarjeta | Comprobado en UI/API fixture | PASS |
| F22 | editar porcentaje conserva conteo | Chromium escritorio, servidor/BD fixtures locales | editar porcentaje conserva conteo | Comprobado en UI/API fixture | PASS |
| F23 | error de lectura y reintento recuperan módulo Cupones | Chromium escritorio, servidor/BD fixtures locales | error de lectura y reintento recuperan módulo Cupones | Comprobado en UI/API fixture | PASS |
| F24 | cancelar eliminación no envía DELETE | Chromium escritorio, servidor/BD fixtures locales | cancelar eliminación no envía DELETE | Comprobado en UI/API fixture | PASS |
| A28 | Fallo de conteos conserva navegación y permite recuperar conteos reales | Chromium escritorio, API/BD fixtures locales | 7 módulos utilizables, error específico, reintento recupera conteos | 7 módulos; error y reintento visibles; respuesta posterior restaura conteos | PASS |

## Validación remota pendiente

BLOQUEADA: sesión Admin real, alta/edición persistente de producto de prueba, imagen en catálogo/detalle tras guardar y operaciones de los módulos con usuario real. Sin credenciales de prueba autorizadas disponibles. La preview mantiene escrituras bloqueadas; las cuentas/roles no se cambian para completar QA. Auth/customer A/B: evidencia separada PR55, no duplicada aquí.

## Remoto ejecutado

24 PASS, 0 FAIL. R01–R24 completos en [remote-matrix.json](remote-matrix.json). Verificación anónima/archivos/configuración y guardas; no sustituye pruebas autenticadas.

| ID | Verificación | Estado | Causa |
|---|---|---|---|
| AUTH01 | Registro real sin confirmación | BLOQUEADA | Sin Auth Management seguro ni cuentas controladas de QA |
| AUTH02 | Login, persistencia y renovación reales | BLOQUEADA | Sin Auth Management seguro ni cuentas controladas de QA |
| AUTH03 | Logout y nuevo login reales | BLOQUEADA | Sin Auth Management seguro ni cuentas controladas de QA |
| CART01 | Aislamiento remoto entre dos cuentas y combinación visitante | BLOQUEADA | Sin Auth Management seguro ni cuentas controladas de QA |
| REVIEW01 | Eliminación propia/rechazo ajena con cuentas reales | BLOQUEADA | Sin Auth Management seguro ni cuentas controladas de QA |
| ADMIN01 | Acceso Admin autenticado real | BLOQUEADA | Sin sesión Admin/customer real autorizada disponible; escrituras protegidas |
| ADMIN02 | Rechazo customer con sesión real | BLOQUEADA | Sin sesión Admin/customer real autorizada disponible; escrituras protegidas |
| ADMIN03 | Guardar producto de prueba y persistir | BLOQUEADA | Sin sesión Admin/customer real autorizada disponible; escrituras protegidas |
| ADMIN04 | Imagen guardada visible en catálogo/detalle | BLOQUEADA | Sin sesión Admin/customer real autorizada disponible; escrituras protegidas |
| ADMIN05 | Operaciones módulos con sesión Admin real | BLOQUEADA | Sin sesión Admin/customer real autorizada disponible; escrituras protegidas |
