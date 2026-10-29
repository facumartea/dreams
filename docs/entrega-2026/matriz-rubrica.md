# Matriz completa · Rúbrica 2026

Fuente: [PDF 2026 adjunto](rubrica-2026.pdf), 3 páginas; [texto extraído](rubrica-2026.txt). No se sustituyó por una rúbrica 2025. Fecha de evaluación técnica: 29/10/2026. Estados: CUMPLE = evidencia suficiente del alcance indicado; PARCIAL = evidencia o implementación incompleta; NO CUMPLE = discrepancia conocida; NO VERIFICABLE = depende de evidencia no disponible. Un CUMPLE local/documental no certifica funcionamiento publicado ni nota.

| ID | Requisito exacto o fragmento literal del PDF | Evidencia en archivos y funcionamiento | Estado | Corrección realizada o pendiente |
|---|---|---|---|---|
| G01 | «sitio y la imagen corporativa de una marca de producto»; «la marca debe ser de fantasía» | DREAMS; `public/index.html`, PNG y CSS, diseno.md | CUMPLE | Identidad conservada; valoración creativa docente. |
| G02 | «presentar los productos de forma que estos sean vendibles»; «atractivo y funcional» | Catálogo/detalle/carrito; backend candidato401 | PARCIAL | Presentación implementada; cierre funcional remoto bloqueado. |
| G03 | «Javascript, API y SQL»; «ciclos, funciones, condicionales, operadores lógicos» | `public/js`, `server`, migraciones, api.md y defensa.md | CUMPLE | Código y explicación técnica; comprensión individual no acreditada. |
| D01 | «Diseño de un logo: Simple, como máximo 3 colores en PNG» | `public/assets/dreams-isologo-clean.png`, inspección, diseno.md | CUMPLE | Isologo existente sin modificar; tintas de diseño distinguidas del antialias. |
| D02 | «paleta cromática definida y constante» | `public/css/style.css`, diseno.md, capturas locales | CUMPLE | Negro/marfil/dorado conservados. |
| D03 | «jerarquías tipográficas claras» y fuentes acordes | CSS y encabezados semánticos | CUMPLE | Diseño existente conservado, valoración estética docente. |
| D04 | «Navegación clara: botones y enlaces visibles, menús» | Navegación compartida y wireframe real | CUMPLE | Wireframe histórico reemplazado para entrega2026. |
| D05 | «el diseño debe reflejar el tema… atractiva y creativa» | Perfumería, portada estática, tarjetas e imágenes | PARCIAL | Evidencia visual disponible; juicio creativo docente. |
| D06 | «imágenes, íconos, o ilustraciones con criterio estético y funcional» | Imagen de detalle, preview, fallback, iconografía | PARCIAL | Función implementada; licencias individuales no acreditadas, sin inventarlas. |
| P01 | «Leer y escribir código adecuadamente» | Guía de defensa y ejercicios | NO VERIFICABLE | Debe demostrarlo cada integrante. |
| P02 | «Utilizar adecuadamente la documentación» | API, BD, manual, índice, referencias | PARCIAL | Material preparado; uso por alumnos pendiente. |
| P03 | «resolución y autonomía» | Git/continuidad técnica; defensa.md | NO VERIFICABLE | No atribuir al grupo las resoluciones hechas por IA. |
| P04 | «continuidad y proceso de trabajo» | Git, CHANGELOG, bitacora-ia.md | PARCIAL | Hay historia técnica; faltan registros completos de clase/preentrega. |
| P05 | «en cada etapa… uso de IA… complementario» | bitacora-ia.md distingue autoría | NO VERIFICABLE | No hay evidencia de agregados propios y defensa por etapa. |
| R01 | «grupo… no… mayor a 2 alumnos»; «Los grupos NO pueden rotar» | Dos integrantes confirmados por usuario: Martearena y Ruas | PARCIAL | Apellidos resueltos; permanencia del grupo y participación histórica no verificadas. |
| R02 | «Fecha de entrega previa 2 de octubre» | No hay comprobante de entrega adjunto | NO VERIFICABLE | Solicitar evidencia que conserven los alumnos; no inventar fecha. |
| R03 | «Fecha de entrega final 6 de noviembre» | Preparación al29/10; no envío | PARCIAL | Falta cierre y entrega por usuario antes de fecha. |
| R04 | «app web o sitio HTML/CSS/JS aplicando/consumiendo una API» | HTML/CSS/JS y Supabase; api.md | CUMPLE | Recorrido documentado; conexión candidata pendiente por separado. |
| R05 | «Mostrar productos… de una base de datos… backend… SQLlite… Flask… Node.js» | Real: Supabase/PostgreSQL; el usuario confirmó aceptación docente el29/10/2026, registrada en sqlite.md | PARCIAL | Excepción comunicada por usuario resuelve motor, sin afirmar equivalencia ni comprobante docente adjunto. Conexión/QA remota siguen pendientes. |
| R06 | «Node.js… registro de las versiones usando Git (github)» | Historial de facumartea/dreams, PR56 | CUMPLE | Checkpoints sin reescritura; ZIP exacto identifica commit. |
| R07 | «pantalla de login… y de registro» | `public/cuenta.html`, `cuenta.js`, registro/signIn | PARCIAL | Pantallas y tests locales; real candidato bloqueado y oficial403 previo. |
| R08 | «productos… editarse… interfaz específica… usuario autorizado» | Admin, guard rol, JWT, readback de persistencia | PARCIAL | Implementado y probado con fixtures; falta Admin real/guardado remoto. |
| R09 | «si o si Javascript» | Código propio de navegador y servidor | CUMPLE | Uso real, no sólo librería. |
| R10 | «carousel» | Carrusel manual de colecciones en Inicio candidato | PARCIAL | Añadido y comprobación local registrada; no publicado. |
| R11 | «web semántica» | HTML header/nav/main/section/article/footer y labels | CUMPLE | Evidencia de fuente; auditoría WCAG completa no realizada. |
| R12 | «diseño adaptable… (responsive)» | CSS media queries, matriz previa y capturas locales | PARCIAL | Nueva verificación local acotada; final remoto pendiente. |
| O01 | «Wireframe… conexiones de las páginas… herramienta ad-hoc» | wireframe.png y SVG editable, wireframe.md | CUMPLE | Adaptado de propuesta suministrada, realmente versionado. |
| O02 | «Manual de uso» | manual.md/PDF, capturas con procedencia | PARCIAL | Completo como guía candidata; capturas finales remotas pendientes. |
| O03 | «Diseño de base de datos» | base-de-datos.md/.mmd, columnas reales JSON | CUMPLE | Real vs histórico separados; reproducción en proyecto nuevo no ejecutada. |
| O04 | «Bitácora… en cada preentrega… fecha, prompts, resultado» | bitacora-ia.md y CHANGELOG | PARCIAL | Registro técnico honesto; faltan prompts/comprobantes de preentrega. |
| O05 | «Link a la API. Explicación de su uso» | api.md con documentación pública, recorrido y ejemplo | CUMPLE | WhatsApp identificado como enlace, no API. |
| M01 | «programa principal y… funciones no supera las 40 líneas… modularizado» | Inventario AST y comando sin.git, funciones.md | CUMPLE | Refactorización con callbacks/métodos; alcance e interpretación de main explícitos. |
| M02 | «Indentado correctamente… comentarios… claro y legible… Frontend / Backend» | Módulos, validación y comentarios de responsabilidades | PARCIAL | Refactorizaciones nuevas legibles; tests históricos compactos no reescritos por estética. Revisión docente pendiente. |
| E01 | «Correcto funcionamiento sin errores… conecta correctamente» | candidato401; pruebas remotas bloqueadas | NO CUMPLE | Reemplazo seguro de Secret, lectura/SDK y QA completa antes de publicar. |
| E02 | «Todos los integrantes poseen… documentación… justificar y explicar» | Carpeta descargable y defensa.md | NO VERIFICABLE | Accesibilidad del repositorio no demuestra posesión ni dominio individual. |
| E03 | «IA… complemento… registro completo… muchos agregados…» | Bitácora parcial, autoría no inventada | PARCIAL | Faltan registros e intervención propia acreditada; no se asigna puntaje. |
| E04 | «Se entrega en tiempo y forma sin mayores correcciones» | ZIP candidato y bloqueos | NO VERIFICABLE | No hay entrega Classroom realizada por el agente. |
| E05 | «Trabajo en clase… todos… aportan… constantemente» | Sin evidencia de asistencia/participación | NO VERIFICABLE | Evidencia de integrantes/profesor, fuera de inferencia técnica. |
| E06 | «Autonomía… una o dos consultas por clase… vías alternativas» | Sin observación de clase | NO VERIFICABLE | No inferir autonomía de alumnos a partir de trabajo IA. |
| E07 | «Todos los documentos… accesibles… al momento de la corrección» | INDICE, relativos, Markdown/PDF/PNG/JSON en PR | PARCIAL | Falta integrar branch predeterminada al resolver dependencias. |
| E08 | «Nombre archivo… formato solicitado» | Apellidos confirmados: Martearena y Ruas | PARCIAL | Nombre previsto Martearena-Ruas-DREAMS.zip; usuario pidió no generar otro ZIP final. No se afirma entrega de un archivo con ese nombre. |
| F01 | «Carpeta comprimida… [apellido1-apellido2-apellido3-nombreproducto].zip» | zip.md y extracción sin.git | PARCIAL | Usuario prioriza actualización de GitHub y no generar otro ZIP final; extracción anterior acreditada. Ejemplo del PDF no obliga a tres integrantes contra límite2. |
| F02 | «solo… aula virtual (classroom) de INFORMÁTICA» | No se envía nada automáticamente | NO VERIFICABLE | Entrega final debe realizarla usuario; conservar comprobante. |
| A01 | «puntaje… superar los 30… criterios fundamentales» | Esta matriz no asigna nota | NO VERIFICABLE | Sólo el profesor puede evaluar; El funcionamiento remoto pendiente bloquea el cierre; SQLite resuelto por excepción comunicada por usuario. |
| A02 | «nota grupal y… individual… puede coincidir o no» | Defensa/participación individual pendiente | NO VERIFICABLE | No garantizar aprobación ni puntaje. |
| A03 | «no… completar… período de diciembre» | Condición docente, sin resultado anticipado | NO VERIFICABLE | Registrar si se aplica; no anticipar decisión. |

La escala completa 5/3/2/1 y sus descriptores quedan preservados literalmente en el PDF y el texto adjuntos, incluidos Diseño visual, Modularidad, Documentación, Uso de IA, Programa/Sitio, Codificación, Entregas, Trabajo en clase, Autonomía, Presentación y Nombre de archivo. Esta matriz audita requisitos; no transforma esas escalas en una calificación automática.

Aclaración vigente del29/10/2026: el usuario confirmó aceptación docente de Supabase y los apellidos Martearena/Ruas. No se solicita otra prueba de aceptación para continuar ni se migra la base. La referencia al comprobante no adjunto describe la procedencia de la evidencia, no un nuevo bloqueo.
