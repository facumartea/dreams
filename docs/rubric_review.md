# Adecuación a la rúbrica de Integración Diseño–Programación

Revisión del 13 de octubre de 2026 (America/Buenos_Aires). Fuente de la consigna: **Rubrica 2025 - Integracion Diseño Programación.docx**, adjunta por el usuario. Esta revisión no asigna una nota: asistencia, autonomía en clase, explicación individual y aprobación corresponden al profesor.

## Alcance y dependencias

Rama `codex/rubric-academic-review`, base `3365e57` de PR #46; preserva buscador por nombre/marca y correcciones de imagen/guardado del Admin. Dependencia transitiva PR #44/#42/#41/#39/#38/#37/#34. No hay merges. PR #45 (carrito por cuenta) y PR #40 (video) permanecen separadas. La portada es estática y no se publica esta revisión en la oficial.

Al inicio: oficial Pages `ac755bbe-f339-422a-91ef-006426abf0bf`, fuente del proxy `c83b148`, backend inmutable `d5df723d`; preview Admin `fa8761cd`; preview académica con video independiente. Las PR abiertas y sus SHA se consultaron en GitHub. No asumir que un alias Workers sirve el mismo commit que Pages.

## Matriz de cumplimiento

`D` = documento del profesor; `U` = pedido adicional; `V` = verificación técnica pedida. Los estados distinguen implementación, pruebas locales y acceso remoto.

| Origen / requisito | Evidencia concreta | Inicial → final | Corrección / pendiente |
|---|---|---|---|
| D: marca de fantasía e identidad propia | `public/index.html`, assets DREAMS, tokens en `public/css/style.css` | Cumple → cumple | Identidad preservada; autoría/licencias originales requieren confirmación de integrantes |
| D: logo PNG, máximo tres colores | `public/assets/dreams-isologo-clean.png` PNG RGBA transparente, 56×79; inspección Pillow | Parcial → parcial | 921 colores visibles de píxel por tonos/suavizado; no asegurar cumplimiento estricto de tres colores. Confirmar criterio de tintas con profesor o proporcionar original vectorial/PNG aprobado |
| D: coherencia visual y paleta | Tokens negro/marfil/champagne; variantes de colección; capturas móvil/escritorio | Cumple → cumple en cobertura | No rediseño ni video agregado |
| D: tipografía y jerarquía | Encabezados, texto y controles existentes; CSS `--display` y escala responsive | Cumple → cumple en cobertura | No evaluación estética inventada del profesor |
| D: navegación clara | Inicio, Perfumes, colecciones, Nosotros, Cuenta, Carrito; `navigation.js` | Cumple → cumple en cobertura | QA de enlaces, móvil y teclado descrita en evidencia |
| D: imágenes/íconos pertinentes | Perfume de portada y productos reales; `safe.js`; revisión de PR46 | Parcial → parcial | Cinco fallbacks existentes de productos 21/205/198/197/16 y licencias por confirmar; no reemplazos masivos |
| D: opción HTML/CSS/JS consumiendo API | Frontend → `/api` Express → SDK de Supabase Auth/PostgREST | Cumple técnicamente → cumple técnicamente | Aceptado según confirmación del usuario; no migrar a Flask/SQLite |
| D: mínimo cuatro páginas | Ocho HTML: inicio, catálogo, producto, nosotros, carrito, cuenta, checkout, resultado; Admin privado adicional | Cumple → cumple | Páginas reales, no una captura como sitio |
| D: JavaScript | `public/js`, `server`, `worker`; tests ejecutados | Cumple → cumple | Sin dependencia de UI pesada |
| D: carrusel obligatorio | `featured-carousel.js`, región `featured-products` de Inicio | No cumple → cumple implementado | Productos distintos del listado real; controles Anterior/Siguiente, sin autoplay, movimiento reducido; hero intacto |
| D: HTML semántico | `header/nav/main/section/footer`, títulos, forms/labels, región de carrusel | Cumple → cumple en cobertura | No se presenta como auditoría WCAG completa |
| D: diseño adaptable | CSS y Chromium a 390/1440 | Parcial → cumple en tamaños probados | Dispositivo físico y Safari no verificados |
| D: funciones y principal ≤40 líneas | Inventarios AST y puntos de entrada descritos abajo | No cumple → cumple en alcance inventariado | Límite adicional del usuario es más estricto |
| U: funciones propias ≤20 líneas | `scripts/function-lines.js`, `scripts/sql-function-lines.js`, `test/function-lines.test.js` | No cumple (78 JS) → cumple | Incluye tests, callbacks, métodos y SQL/DO; dependencia/generated excluidos expresamente |
| D/U: indentación y comentarios útiles | Helpers de sesión, origen, cotización, firma académica, imagen y runtime; contexto por instancia | Parcial → mejorado | Conserva contratos y orden; no comprime funciones para pasar el contador |
| D: pseudocódigo y/o wireframes | `docs/wireframe.md`, `docs/pseudocodigo.md` | Parcial/obsoleto → cumple documental | Retiradas referencias activas a favoritos |
| D: manual visitante/Admin | `docs/manual_de_uso.md` | Parcial/obsoleto → cumple documental | Explica restricciones de preview y simulación sin credenciales |
| D: diseño de DB | `docs/documentacion.md`; SELECT de columnas/FK/RLS del proyecto real | Parcial → cumple documental | Nueve tablas reales, todas con RLS; sin migraciones ni datos modificados |
| D: link API y uso explicado | `docs/documentacion.md`; enlaces Supabase JS/Auth/Data API | Parcial → cumple documental | WhatsApp es enlace, no consumo de API externa |
| D: programa correcto y sin errores | Base 139 tests, suite final y QA en evidencia | Parcial → parcial | Auth/Admin remotos y carrito por cuenta no acreditados; error 401 histórico y enlaces externos siguen pendientes |
| U: seguridad de contraseñas | `docs/auth_security_review.md`, SDK/server/cookies, docs oficiales vigentes | Parcial → verificado estáticamente y con fixtures | No se consultaron hashes ni se cambiaron passwords/roles; sesión legítima remota pendiente |
| V: buscador Admin e imágenes | PR46 preservada; tests y QA con fixture local autorizado | Parcial → verificado localmente | Preview rechaza escrituras comerciales; no guardar sobre productos reales |
| V: login/logout/permisos | Integración HTTP y runtime workerd con fixtures; Admin anónimo remoto 403 | Parcial → parcial | Falta sesión legítima para QA autenticado remoto; no inferirla de fixtures |
| V: carrito por usuario y aislamiento | PR45 separada; oficial/base actual usa selección visitante local | Parcial → parcial | No incorpora PR45 ni afirma aislamiento por cuenta; falta QA con dos sesiones reales |
| V: checkout académico | `/api/presentation/*`, envío cero, ticket HMAC v2, intent UUID, pruebas sin lecturas financieras | Cumple → cumple en cobertura probada | Pasarela comercial no activada ni declarada validada |
| V: footer/contactos/filtros | Plantilla compartida, `contacts.js`, catálogo y navegación | Cumple → cumple en cobertura | Sin envíos WhatsApp/correos de QA |
| D: grupo de máximo tres alumnos | Footer identifica autores; no prueba matrícula/tamaño definitivo | No verificable → no verificable | Apellidos confirmados por usuario: Marteaena y Ruas; dos integrantes según esa respuesta, aportes/asistencia no inventados |
| D: documentación individual y capacidad de explicarla | Documentos accesibles en repositorio | No verificable → no verificable | Cada integrante debe tener copia y justificarla personalmente |
| D: trabajo/asistencia/autonomía en clase | No hay registro escolar verificable en repositorio | No verificable → no verificable | Git no demuestra asistencia ni consultas por clase; confirmar con profesor |
| D: entregas parciales/fechas | Documento de 2025: 30 de octubre / 12 de noviembre | No verificable → no verificable | Usuario confirmó las condiciones consultadas; se conservan día/mes del documento sin inventar entregas ni programación de fechas |
| D: documentos accesibles al corregir | Índice `docs/README.md` y repositorio público | Parcial → preparado | Accesibilidad para profesor/integrantes requiere su comprobación |
| D: ZIP y nombre solicitado | Procedimiento de exportación abajo | Pendiente → preparado, no generado | Nombre confirmado por usuario: Marteaena-Ruas-DREAMS.zip; exportar tras commit/validaciones, no envío a Classroom |
| D: aprobación >30 puntos y nota individual/grupal | Regla de la consigna | No verificable → no verificable | Sólo profesor puede puntuar y aprobar; sin porcentaje o nota inventados |

## Convención reproducible de líneas

JavaScript: Acorn reconoce declaraciones, expresiones de función, flechas, callbacks, getters/setters y métodos. Se cuentan líneas físicas **desde la declaración/signatura hasta el cierre, ambas incluidas**, con comentarios y líneas vacías interiores. El nombre/signatura del método también se cuenta. Un string que dice `function` no es una función. Se incluyen todos los JS/MJS/CJS mantenidos y rastreados o nuevos no ignorados; no se incluye `node_modules`, `dist`, `.wrangler` ni código de terceros/generated ignorado. No se excluyen tests ni callbacks por tamaño.

SQL/PLpgSQL: `libpg-query` identifica `CREATE FUNCTION` y `DO` sobre SQL versionado. Los offsets PostgreSQL se traducen desde bytes UTF-8; se cuentan declaraciones completas, comentarios interiores y cierre. El parser SQL reconoce la definición; no se afirma analizar el lenguaje interno PLpgSQL con un segundo compilador. Las migraciones históricas no se reescriben ni se aplican.

Principal: son los puntos de orquestación (`start`, fetch Workers/proxy, `main` de build/medidores, inicializadores DOM y bootstrap de check), **no todo el archivo de un módulo, sus definiciones ni tablas de datos/configuración**. Cada función de entrada queda dentro de 20 (y por tanto de 40); `scripts/check.js` conserva un bloque de ejecución de menos de 40 líneas. Los bloques `DO` están inventariados. Esta interpretación se comunica al profesor, no se oculta como si todo archivo tuviera veinte renglones.

Reproducir: `corepack pnpm run check` (sintaxis y ambos inventarios), `node scripts/function-lines.js` y `node scripts/sql-function-lines.js` (JSON detallado), `corepack pnpm test`, builds y audit. Base antes de editar: 139/139, check 51, 985 funciones JS y 78 superiores a veinte. Los resultados finales y exclusiones concretas se registran en `docs/rubric_validation.md`.

## Preparación de carpeta ZIP

1. El usuario confirmó apellidos **Marteaena** y **Ruas** (se respeta la grafía indicada), nombre `Marteaena-Ruas-DREAMS.zip`. El footer no se renombra por esta confirmación de archivo.
2. Elegir un commit revisado con CI verde y documentación completa.
3. Exportar **sólo archivos versionados**: `git archive --format=zip --output="../Marteaena-Ruas-DREAMS.zip" COMMIT-REVISADO`.
4. Inspeccionar contenido antes de entregar: sin `.env` real, `.dev.vars`, credenciales, sesiones, `node_modules`, `.git`, `.wrangler`, logs privados, videos exclusivos de otra branch ni artefactos grandes innecesarios. `.env.example` contiene sólo nombres y ejemplos no secretos.
5. Adjuntar índice, manual, matriz, arquitectura/DB, pseudocódigo y evidencia. No declarar la carpeta entregada mientras no exista.
6. Cada integrante conserva los documentos y debe poder explicarlos. La entrega en Classroom la realizan los alumnos; esta tarea no envía nada.
