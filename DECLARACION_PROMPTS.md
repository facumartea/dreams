# Declaración de uso de IA y registro parcial de prompts de DREAMS

**ESTADO: PARCIAL. No es una exportación completa ni un historial exhaustivo.** Preparación inicial 10/11/2026; consolidación de declaración/bitácora 11/11/2026. Base histórica revisada: main `60451cabe5ff9b78f97777d64120e5ff9a3238b2`; esta limpieza parte de `8ad5401fe0f2d0c3e501ab203f6ab37b27ff7db1`.

## Declaración y alcance

Las entradas disponibles documentan asistencia de IA en análisis, correcciones de código, pruebas y documentación. No permiten atribuir programación manual, revisión o participación a un integrante sin evidencia. La limpieza conserva ese reconocimiento y no presenta el historial parcial como si fuera completo.

Integra el adjunto PROMPTS_DREAMS_PARCIAL.md, referencias a la bitácora ya existente, algunos mensajes originales completos visibles en esta conversación y resúmenes de fases verificadas en Git. La transcripción privada sólo orienta la guía: no se publica el relato, nombres ni archivos de audio. No se copian valores de claves, cookies, contraseñas ni datos personales. Cuando aparece un valor sensible debe reemplazarse por [SECRETO OMITIDO]. Los nombres de variables de configuración no son sus valores.

Las fechas de commits/PR acreditan implementación, no prueban cuándo se escribió un prompt ni quién programó o revisó. Una autorización o preferencia expresada por el usuario no acredita revisión de código de un integrante. Cada entrada identifica cita, extracto o resumen. No se reconstruyen originales ausentes.

No se duplica el archivo adjunto como otro registro independiente. Sus ocho extractos se conservan aquí. La [bitácora previa está consolidada abajo](#f-bitácora-histórica-consolidada) con su procedencia y límites; ya no se mantiene un segundo registro independiente. Sus entradas no se convierten en citas literales por estar en una tabla.

## A. Extractos del adjunto parcial

### A01. Auditoría del Admin

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> necesito revisar y corregir toda la pagina https://dreams-perfumes.pages.dev/admin revisarla muchas veces absolutamente todas las funciones y botones que se pueda hacer toda

- Objetivo: Auditar y corregir controles Admin.
- Resultado/evidencia: Coincidencia temática con PR56, merge 5236ef6 del 03/11/2026; no demuestra fecha ni relación causal exacta de este extracto. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: Bitácora y evidencia Admin acreditan pruebas del agente en fases locales/remotas; no se repiten ahora.
- Revisión humana: no acreditada en el adjunto.

### A02. Checkout y cupón

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> quiero que aca aparezca para poner el cupon de descuento

- Objetivo: Aplicar cupón desde el carrito.
- Resultado/evidencia: Coincidencia temática con PR57, merge 6865365 del 03/11/2026. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Suite, pruebas locales y Chromium oficial según el informe, diferenciados.
- Revisión humana: no acreditada en el adjunto.

### A03. Formato de vencimiento

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> en la parte del vencimiento que sean cuatro numeros y que se ponga la barra en el medio

- Objetivo: Formatear vencimiento con cuatro dígitos y barra.
- Resultado/evidencia: Coincidencia temática con PR57; formato local y pruebas de pegado/edición acreditadas. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Casos de entrada remotos y regresiones de máscaras del agente, según informe.
- Revisión humana: no acreditada en el adjunto.

### A04. Presentación del envío

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que no dia envio gratis sacale solo la palabra "gratis" que aparezca envio $0

- Objetivo: Cambiar presentación de envío a Envío $0.
- Resultado/evidencia: Coincidencia temática con PR57; no se cambió el costo cero. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Totales y resumen hasta confirmación acreditados por el agente.
- Revisión humana: no acreditada en el adjunto.

### A05. Quitar una sección

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> quiero sacar toda esta seccion del inicio

- Objetivo: Retirar una sección de Inicio.
- Resultado/evidencia: No se identifica cuál sin la captura original. PR58/b60e33d retiró colecciones; PR62/60451ca retiró recientes. No se adjudica el extracto a ninguna por suposición. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/home-removal-20261103/README.md).
- Pruebas del agente: Existen verificaciones por cada fase; no prueban a qué sección se refería esta cita.
- Revisión humana: no acreditada en el adjunto.

### A06. Cabeceras de colecciones

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que las tres letras de las 3 secciones sean las mismas y que el ancho de la caja del titulo de cada seccion sea mas "largo" de largo como estaba antes

- Objetivo: Uniformar letras y ancho de cajas de colecciones.
- Resultado/evidencia: Sin correspondencia de implementación exacta acreditada. PR62 quitó párrafos y ajustó composición; eso no prueba que aplicara este pedido tipográfico. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/inicio-cabeceras-20261105/README.md).
- Pruebas del agente: No se asignan pruebas del agente a un pedido ambiguo sin su contexto.
- Revisión humana: no acreditada en el adjunto.

### A07. Registro de IA

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> si tambien necesito hacer una declaracion de prompts o similar ayudame a cranear eso

- Objetivo: Preparar declaración/registro de prompts.
- Resultado/evidencia: Bitácora existente y consolidación actual; no hay un resultado histórico exacto vinculado al mensaje. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: En esta tanda se comprueban fuentes, sanitización y enlaces; no se acreditan revisiones humanas por esto.
- Revisión humana: no acreditada en el adjunto.

### A08. Material de defensa

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> traducilos estos son auidos de un amigo que hizo la defensa oral y le tomo eso necesito tambien subir un archivo .md con todos los prompts que hice para la pagina hace uno para work y que me ayude a estudiar haciendome un word con las respuesta de todo absolutamente me dijo mi ammigo pero ocn mi pagina y hay que sacar muchisimos archivos del github

- Objetivo: Preparar estudio con temas de audios, registro de prompts y revisión de archivos.
- Resultado/evidencia: Guía adjunta preparada según su texto el 10/11/2026 sobre 60451ca. Esta tarea la contrasta y amplía; no hubo commit previo de ese Word en main. Fuente: guía de estudio aportada; retirada en esta limpieza por indicación del usuario..
- Pruebas del agente: Lectura estática, cotejo de endpoints y revisión de Word/PDF en esta tanda; no nueva QA funcional.
- Revisión humana: no acreditada en el adjunto.

## B. Bitácora previa y resultados verificables

Estas entradas son **resúmenes**, no prompts originales ni nuevas ejecuciones. Se enlazan las fuentes para evitar duplicar la bitácora y se señala la diferencia entre fecha del documento y fecha del commit.

### B01. Arquitectura y seguridad inicial

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: La bitácora etiqueta una etapa 28/08/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Auditar arquitectura/seguridad y preparar despliegue.
- Resultado: CHANGELOG y auditorías preservadas; no se reconstruye el mensaje inicial. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: Pruebas declaradas en las fuentes históricas; no repetidas ahora.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B02. Diagnóstico de credencial y continuidad

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: Git: 29ee9ea del 27/10/2026, 6f54b08 y 2b8dcc1 del 28/10; be57610 del 29/10.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Conservar la oficial y diagnosticar el candidato sin exponer valores.
- Resultado: La bitácora etiqueta 29ee9ea bajo 28/10, pero Git fecha ese commit 27/10. Se conserva la discrepancia; no se inventa la fecha del prompt. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: Sondas y tests reportados por el agente en la bitácora; un 401 inicial no se presenta como conexión resuelta.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B03. Reparación de backend y Admin

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR56: merge 5236ef6, 03/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Cerrar registro, sesión, Admin y documentación funcional.
- Resultado: El cierre histórico documenta QA real y retirada del mecanismo temporal; no hay nueva ejecución en esta tanda. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: 476 tests y 89 casos remotos según bitácora de cierre; leer su alcance y fecha.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B04. Auditoría documental inicial 2025

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR59: f0f3886, 03/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Auditar fuente descargable y preparar gráficos.
- Resultado: El PDF2025 faltaba entonces; la matriz provisional no se convierte retrospectivamente en auditoría del PDF recibido luego. Fuente: índice documental anterior, reemplazado por docs/README.md..
- Pruebas del agente: Checks y evidencia en auditoria-2025/pruebas.json; no nueva QA por esta consolidación.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B05. Limpieza y rúbrica 2025 recibida

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR60: 3e12bc6, 05/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Leer la edición correcta, organizar y preservar registros.
- Resultado: Se retiró NEXT_CHAT_PROMPT.md obsoleto y se preservaron históricos; esta tarea no repite esa limpieza. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/entrega-2025/informe.md).
- Pruebas del agente: 489 tests y extracción sin .git según pruebas.json histórico.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B06. Scripts coherentes, carrusel y SQL

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR61: e6d60bf, 05/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Resolver los pendientes técnicos y documentar la oficial.
- Resultado: Se aplicó migración nueva compatible; carrusel manual, scripts coincidentes, QA Admin real. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/cierre-tecnico-20261105/README.md).
- Pruebas del agente: 494 tests, 4 PostgreSQL aparte, 22 checks oficiales de checkout/carrusel y QA específica, según evidencia.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B07. Inicio y cabeceras sin extras

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR62: 60451ca, 05/11/2026 (Git con zona -03:00).
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Retirar recientes y párrafos visibles, conservar carrusel y SEO.
- Resultado: Fuente publicada 85147d8; main integra documentación final. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/inicio-cabeceras-20261105/README.md).
- Pruebas del agente: 493 tests, 52 checks locales/oficiales y hashes de scripts según evidencia. Fechas UTC pueden caer el día siguiente sin implicar otra etapa.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

## C. Mensajes originales completos disponibles

Los bloques siguientes conservan el texto íntegro de mensajes seleccionados visibles en esta conversación, sin corregir su escritura. Su inclusión no convierte el conjunto en una exportación completa. Los mensajes largos de otras etapas se representan por las fuentes/resúmenes anteriores; para un historial literal exhaustivo faltan exportaciones, orden y adjuntos originales.

### C01. Consulta de endpoints y decoradores

- Fecha del mensaje: **sin fecha confirmada**; no se infiere de la fecha del Word adjunto.
- Tipo: prompt original completo visible; no exportación de toda la conversación.

> cuales son todoa los endpoints de nuestro codigo que es un decorador y donde se encuentra y los metodos

- Objetivo: Preparar explicación de API y conceptos para estudiar.
- Resultado/evidencia: el Word adjunto acredita que existía material de estudio; no prueba por sí solo la ejecución exacta de cada mensaje. La guía ampliada y verificable de esta tarea se publica en defensa.md/.docx/.pdf mediante su PR documental.
- Pruebas del agente: no hay un informe autónomo por cada mensaje C. Las comprobaciones de esta consolidación están en verificacion-defensa-20261110.md; no se atribuyen retroactivamente a esos mensajes ni equivalen a QA de aplicación.
- Revisión humana: no acreditada. La solicitud del usuario no prueba lectura o dominio del material.

### C02. Solicitud de resumen amplio

- Fecha del mensaje: **sin fecha confirmada**; no se infiere de la fecha del Word adjunto.
- Tipo: prompt original completo visible; no exportación de toda la conversación.

> necesito que me hagas un mini resumen de dónde están los Points, cuáles son todos los endpoints que hay en nuestro código cómo modificar la base de datos cómo está conectada a la datos como está conectada subscript todas las preguntas que nos podría ser hacer imagínátetelas y pensarlas, el profe los templates qué es un decorador para qué sirve donde se encuentra cómo se encuentra y todo lo de los métodos qué hay en cada carpeta cómo hacer para crear un usuario borrarlo, autenticarlo

- Objetivo: Relacionar estructura, base de datos, métodos y autenticación.
- Resultado/evidencia: el Word adjunto acredita que existía material de estudio; no prueba por sí solo la ejecución exacta de cada mensaje. La guía ampliada y verificable de esta tarea se publica en defensa.md/.docx/.pdf mediante su PR documental.
- Pruebas del agente: no hay un informe autónomo por cada mensaje C. Las comprobaciones de esta consolidación están en verificacion-defensa-20261110.md; no se atribuyen retroactivamente a esos mensajes ni equivalen a QA de aplicación.
- Revisión humana: no acreditada. La solicitud del usuario no prueba lectura o dominio del material.

### C03. Word con lenguaje simple

- Fecha del mensaje: **sin fecha confirmada**; no se infiere de la fecha del Word adjunto.
- Tipo: prompt original completo visible; no exportación de toda la conversación.

> hacemelo todo en un word y con palabras simples de entender en un lenguaje coloquial pero siempre siguiendo las normas del colegio

- Objetivo: Generar material de estudio con tono respetuoso. El mismo mensaje se repitió en el contexto; se registra una sola vez, sin inventar una nueva fase.
- Resultado/evidencia: el Word adjunto acredita que existía material de estudio; no prueba por sí solo la ejecución exacta de cada mensaje. La guía ampliada y verificable de esta tarea se publica en defensa.md/.docx/.pdf mediante su PR documental.
- Pruebas del agente: no hay un informe autónomo por cada mensaje C. Las comprobaciones de esta consolidación están en verificacion-defensa-20261110.md; no se atribuyen retroactivamente a esos mensajes ni equivalen a QA de aplicación.
- Revisión humana: no acreditada. La solicitud del usuario no prueba lectura o dominio del material.

### C04. Ampliación de Node y formato de respuestas

- Fecha del mensaje: **sin fecha confirmada**; no se infiere de la fecha del Word adjunto.
- Tipo: prompt original completo visible; no exportación de toda la conversación.

> inclui posibles preguntas de node tambien no me escribas las preguntas solo las respuestas como un mini resumen dentro de todo que incluya todo como conectar la base de datos, etc

- Objetivo: Añadir Node y producir aquella versión sin cuestionario. El pedido actual cambia el formato e incluye preguntas/repreguntas.
- Resultado/evidencia: el Word adjunto acredita que existía material de estudio; no prueba por sí solo la ejecución exacta de cada mensaje. La guía ampliada y verificable de esta tarea se publica en defensa.md/.docx/.pdf mediante su PR documental.
- Pruebas del agente: no hay un informe autónomo por cada mensaje C. Las comprobaciones de esta consolidación están en verificacion-defensa-20261110.md; no se atribuyen retroactivamente a esos mensajes ni equivalen a QA de aplicación.
- Revisión humana: no acreditada. La solicitud del usuario no prueba lectura o dominio del material.

## D. Esta consolidación

- Fecha comprobable: **10/11/2026**, mensaje de tarea actual y fecha de elaboración.
- Tipo: resumen fiel del pedido actual; el texto completo de la tarea se conserva debajo.
- Objetivo: guía oral contrastada, registro parcial consolidado, limpieza justificada y simulacro una pregunta por vez.
- Resultado/evidencia: defensa.md/.docx/.pdf, endpoints-verificados.json, este registro y revisión de limpieza; [PR #63](https://github.com/facumartea/dreams/pull/63), checkpoint documental [2cf4eb4](https://github.com/facumartea/dreams/commit/2cf4eb404e17c8ca2843b3d73d1266ce4911792e).
- Pruebas del agente: cotejo de 46 métodos/rutas, referencias de archivos/funciones, scan de datos sensibles, enlaces locales, revisión visual de documentos y diff limitado. [CI #252](https://github.com/facumartea/dreams/actions/runs/42925703488) aprobado: 493 tests, 0 fallidos, 4 omitidos por falta de PostgreSQL de prueba, inventario y builds sin despliegue. El cierre documental exige su CI final aprobado. Sin despliegue ni pruebas de escritura reales.
- Revisión humana: pendiente; no se atribuye al alumnado ninguna revisión todavía no observada.

### Prompt completo de esta tarea

```text
Prepará el material final de defensa oral y el registro de prompts de DREAMS.
También revisá qué archivos innecesarios pueden retirarse del repositorio.

REPOSITORIO
https://github.com/facumartea/dreams

Esta tarea es de estudio y documentación.
No cambies ni despliegues la página oficial por estos documentos.

ADJUNTOS
- Word de estudio.
- Transcripción de tres audios de un compañero.
- PROMPTS_DREAMS_PARCIAL.md.

1. CONTINUAR SIN REHACER
Revisá el estado actual del repositorio y las instrucciones.
La guía adjunta se preparó consultando main en 60451ca.
Contrastá sus explicaciones con la versión actual y corregí diferencias.

No repitas auditorías y tests ya acreditados sin motivo.
No alteres trabajo en curso.

2. WORD DE ESTUDIO COMPLETO
Los audios mencionan:
- Archivo principal.
- Estructura de carpetas.
- Qué hace cada archivo y determinadas funciones.
- Express y por qué se usa.
- JavaScript y Node.js.
- Rutas, endpoints y métodos HTTP.
- POST para login.
- Seguridad, hash de contraseñas y CORS.

Revisá el Word y cubrí todos esos temas con:
- Pregunta probable.
- Respuesta breve para decir en el oral.
- Explicación desde cero.
- Archivo y función reales.
- Ejemplo de DREAMS.
- Posibles repreguntas.
- Errores conceptuales frecuentes.

Conservá las distinciones:
- Entrada Node local frente a entrada del Worker oficial.
- Página HTML frente a endpoint de API.
- Node frente a Express y JavaScript.
- API propia frente a servicios externos.
- Hash frente a cifrado y HTTPS.
- CORS frente a control de origen y permisos.
- Código histórico frente a funciones habilitadas.
- Checkout académico frente a cobros comerciales.

No afirmes que hay una biblioteca CORS o una implementación propia
de bcrypt sin comprobarlo.

3. FUNCIONES Y ENDPOINTS
Verificá método, ruta, propósito y permisos de cada endpoint documentado.
Separá rutas habilitadas de las preparadas o históricas.

Incluí funciones representativas de:
- Catálogo y filtros.
- Registro y login.
- Permisos Admin.
- Guardado de productos.
- Carrito por usuario.
- Opiniones.
- Checkout.
- Buscador y disponibilidad baja.

Explicá entradas, proceso, retorno, efectos y errores.
No basta con repetir el nombre de una función.
Incluí ejercicios pequeños y seguros para practicar localmente.

4. REGISTRO DE PROMPTS
Prepará un archivo Markdown consolidado en la documentación de entrega.

Primero revisá la bitácora existente para evitar duplicados.
El archivo adjunto es parcial: no lo presentes como historial completo.

Por entrada registrá:
- Fecha comprobable o “sin fecha confirmada”.
- Prompt original completo cuando esté disponible.
- Extracto o resumen identificado cuando no lo esté.
- Objetivo.
- Resultado y evidencia en commit/PR.
- Pruebas realizadas por el agente.
- Revisión humana solo cuando esté acreditada.

No reconstruyas textos como si fueran citas literales.
Si necesitás exportaciones o mensajes que no tenés, pedime únicamente
las conversaciones faltantes. Continuá lo independiente mientras respondo.

Eliminá de los registros contraseñas, tokens, cookies y datos personales.
Usá [SECRETO OMITIDO] donde corresponda.
No inventes autoría, fechas ni participación.

5. LIMPIEZA DEL REPOSITORIO
Reutilizá el inventario y la limpieza anteriores.

Identificá:
- Prompts operativos obsoletos.
- Archivos temporales.
- Duplicados exactos.
- Documentación contradictoria.
- Evidencia repetida sin utilidad adicional.

Podés eliminar únicamente descartables comprobados y prompts de continuidad
obsoletos después de preservar la información académica única.

Antes, verificá referencias en imports, scripts, CI, configuración,
documentación y proceso de publicación.

Conservá:
- README actualizado.
- Código y assets utilizados.
- Dependencias y lockfile.
- Migraciones.
- Tests y configuración vigente.
- Manual, wireframe, D.E.R. y rúbrica.
- Registro de IA y prompts relevante.
- Licencias, atribuciones y evidencias únicas.

No elimines archivos para ocultar uso de IA.
No reescribas historial de Git.
Si un archivo tiene utilidad dudosa o información única, preservalo
y explicá la duda.

6. ENTREGA Y GITHUB
Guardá en la documentación académica:
- Guía de defensa .docx.
- Copia PDF legible.
- Fuente Markdown de la guía.
- Registro consolidado de prompts.
- Índice con enlaces relativos.

Verificá visualmente Word/PDF: sin recortes, tablas ilegibles
o referencias equivocadas.
No subas audios privados del compañero a GitHub sin autorización.
La guía puede resumir sus temas sin identificarlo.

Trabajá en una branch, revisá diff, hacé commit y push y prepará PR.
Integrá los documentos revisados mediante el flujo autorizado del repositorio.
No integres cambios funcionales ajenos.

No hace falta deployment por documentación.

ENTREGA FINAL
- Word y PDF descargables.
- Markdown de prompts, indicando si está completo o qué falta.
- Enlaces GitHub.
- Archivos retirados y motivo.
- Archivos conservados y motivo.
- Commit y estado de integración.

Al terminar, iniciá un simulacro oral:
una pregunta por vez, esperá mi respuesta, corregime con explicación
y pedime que vuelva a responder cuando haga falta.
No respondas por mí antes de que intente contestar.
```

## E. Originales completos disponibles para fases históricas

Estos mensajes completos del contexto complementan los resúmenes B; no sustituyen los originales todavía ausentes ni acreditan cuándo fueron enviados. Los adjuntos/capturas referidos no se reconstruyen.

### E01. Cierre técnico posterior a PR60

- Fecha: **sin fecha confirmada**.
- Tipo: prompt original completo disponible en el contexto, sin sus capturas.
- Objetivo, resultado, commit/PR y pruebas del agente: ver B06; se mantiene la distinción entre pedido e implementación.
- Revisión humana: no acreditada; la autorización de publicar no demuestra revisión de código.

```text
Continuá desde main, commit informado 3e12bc6.
La limpieza de PR #60 ya está integrada: no la repitas.

OBJETIVO
Cerrar los pendientes técnicos de la auditoría 2025 y mantener coherencia
entre repositorio, documentación y página oficial.

ÚNICO SITIO AUTORIZADO
https://dreams-perfumes.pages.dev/

No crees ni modifiques otras webs o previews públicas.
No generes ZIP.

1. CORREGIR LA DIFERENENCIA ENTRE MAIN Y OFICIAL
Investigá por qué checkout.js servido en la oficial contiene una función
de 113 líneas mientras el inventario de main aprueba el límite de 40.

Identificá:
- URL y archivo efectivo.
- Commit de origen.
- Proxy, backend o caché responsable.
- Diferencias funcionales entre ambas versiones.

No reemplaces el archivo a ciegas.
Asegurá una versión compatible que conserve:
- Cupones y totales.
- Formatos de tarjeta y vencimiento.
- Checkout académico sin datos financieros persistidos.
- Referencia estable.
- Prevención de duplicados.
- Carrito conservado ante errores.

Verificá el límite de 40 líneas también sobre los scripts propios
realmente servidos por la oficial, no únicamente sobre main.

2. RECUPERAR EL REQUISITO DE CARRUSEL
Está autorizado implementar un carrusel manual en una sección existente
de productos destacados o equivalente.

No restaures el bloque eliminado “Tres formas de empezar”.
No modifiques la portada estática.

Usá productos reales distintos, controles accesibles, teclado,
adaptación móvil y movimiento reducido.
Sin autoplay y sin inventar contenido comercial.

Comprobá que sea funcional y visible: un archivo o contenedor sin uso
no acredita el requisito.

3. REVISAR LA FUNCIÓN SQL DE 53 LÍNEAS
Determiná si es:
- Una definición histórica reemplazada.
- La función actualmente utilizada.
- Código incluido únicamente para conservar el historial de migraciones.

Documentá esa distinción.

No reescribas una migración aplicada ni comprimas instrucciones.
Si la función vigente necesita modularización para el límite solicitado,
prepará una migración nueva compatible, pruebas y evaluación de permisos
y transacciones antes de aplicarla.

No ejecutes cambios destructivos ni migres datos.
Si el único exceso pertenece al historial inmutable, explicá la excepción
y pedí aclaración del criterio académico en vez de ocultarlo o afirmar
cumplimiento absoluto.

4. QA AUTENTICADA DEL ADMIN
Reutilizá accesos seguros autorizados si siguen disponibles.
No restaures mecanismos temporales ni secretos de QA innecesariamente.

Comprobá con una sesión Admin real:
- Acceso y logout.
- Buscador y disponibilidad baja.
- Alta y edición con producto exclusivo de prueba.
- Guardado y persistencia de imágenes.
- Destacar en Inicio.
- Actualización del catálogo y estadísticas.
- Rechazo de operaciones para customer y anónimo.

No modifiques productos comerciales.
Si falta acceso, pedime temprano el mecanismo seguro concreto.
No declares fixtures locales como prueba remota.

5. DOCUMENTACIÓN COHERENTE
Revisá si el manual PDF alojado en entrega-2026 describe correctamente
la versión actual auditada con la rúbrica 2025.

Actualizá contenidos desfasados y enlaces cuando corresponda.
No dupliques archivos solo para cambiar el nombre de la carpeta.
Actualizá wireframe, matriz e índice por el nuevo carrusel.

Conservá el carácter retrospectivo de los diseños.
No inventes participación, preentregas o defensa individual.

6. VALIDACIÓN Y PUBLICACIÓN
Creá una branch y PR específicas.
Ejecutá checks, pruebas relevantes y builds.
Revisá diff y ausencia de secretos.

Está autorizado integrar y publicar las correcciones verificadas
en la oficial, con rollback compatible.

No incorpores el video exclusivo de preview.
No cambies credenciales Admin, DNS ni pagos comerciales.

Después de publicar:
- Compará los assets servidos con la versión aprobada.
- Repetí el recorrido de checkout.
- Verificá carrusel y Admin.
- Actualizá la matriz con evidencia del commit final.

ENTREGA
- Causa y solución de la diferencia main/oficial.
- Carrusel implementado y probado.
- Estado justificado del SQL histórico.
- Resultado de QA Admin real.
- Manual y gráficos actualizados.
- PR y commits integrados/desplegados.
- Pendientes académicos que requieren intervención humana.

No declares cumplimiento total mientras queden requisitos técnicos
o evidencias sin resolver.

CARRUSEL OBLIGATORIO — REQUISITO PENDIENTE
La auditoría confirmó que falta el carrusel exigido por la rúbrica.
El anterior se eliminó por pedido del usuario.

Está autorizado incorporarlo en “Productos destacados”, reutilizando
esa sección si existe, sin restaurar “Tres formas de empezar”.

- Usá productos reales y distintos del catálogo.
- Conservá la estética de DREAMS.
- Incluí botones Anterior/Siguiente, navegación por teclado y uso táctil.
- Adaptalo a móvil y escritorio.
- Sin reproducción automática.
- Respetá movimiento reducido.
- Conservá enlaces a productos y acciones existentes.
- No alteres la portada estática.

Verificá su funcionamiento real en la OFICIAL:
https://dreams-perfumes.pages.dev/

Actualizá wireframe, manual y matriz de la rúbrica con evidencia
del carrusel publicado.
```

### E02. Retirada de recientes y textos visibles

- Fecha: **sin fecha confirmada**.
- Tipo: prompt original completo disponible en el contexto, sin sus capturas.
- Objetivo, resultado, commit/PR y pruebas del agente: ver B07; se mantiene la distinción entre pedido e implementación.
- Revisión humana: no acreditada; la autorización de publicar no demuestra revisión de código.

```text
Aplicá estos cambios en la OFICIAL:
https://dreams-perfumes.pages.dev/

Continuá desde el estado actual sin repetir procesos ya acreditados.
La eliminación de los elementos indicados está autorizada.

1. TEXTO DEL CARRUSEL
Quitá de la interfaz visible “Desde el producto 1 de 8” y sus variantes
al avanzar.

Conservá el carrusel de Productos destacados, sus productos y controles:
es necesario para la rúbrica.
Si el indicador sirve para accesibilidad, mantenelo solo para lectores
de pantalla, sin dejar espacio visible.

2. ELIMINAR PRODUCTOS VISTOS RECIENTEMENTE
Retirá toda la sección de la primera captura:
- “Tu recorrido”.
- “Perfumes que viste recientemente”.
- Tarjetas, acciones, separadores y espacio reservado de ese bloque.

Retirá su lógica y estilos exclusivos si dejan de utilizarse.
No borres productos, imágenes compartidas ni componentes del catálogo.
No modifiques carrito ni cuentas.
Si su almacenamiento local queda sin uso, dejá de escribirlo sin afectar
otras claves.

3. QUITAR DESCRIPCIONES DE LAS CABECERAS
En Perfumes, Hombre, Mujer y Unisex, eliminá los párrafos descriptivos
que acompañan al título de la colección.

Ejemplo a retirar:
“Una selección sobria y profunda, con carácter, precisión y presencia”.

Eliminá también los textos equivalentes de las demás colecciones.
Conservá títulos, paletas, identidad visual y filtros.

Ajustá la composición para no dejar una columna vacía ni espacios excesivos.
No elimines descripciones de productos ni metadatos SEO por este pedido.

4. VALIDACIÓN Y PUBLICACIÓN
Comprobá móvil y escritorio:
- Ausencia de los textos y sección solicitados.
- Sin huecos, desbordes ni errores de consola.
- Carrusel obligatorio funcional.
- Navegación, filtros y carrito sin regresiones.

Actualizá wireframe, manual y auditoría cuando el cambio los afecte.
Respetá funciones de máximo 40 líneas.
Ejecutá checks pertinentes y build, revisá diff, hacé commit y push
y prepará o actualizá la PR.

Integrá y publicá los cambios verificados únicamente en la OFICIAL,
con rollback disponible. No modifiques otras webs ni previews.

Entregá URL, commit publicado y capturas de Inicio y cabeceras corregidas.
```

## Qué falta para un historial completo

1. Exportaciones originales de las primeras etapas y preentregas anteriores a PR56, con sus fechas reales. Los commits y la bitácora no sustituyen esos mensajes.
2. Mensajes completos y contexto/capturas de los ocho extractos A01–A08, especialmente qué sección se pretendía quitar y qué cambio tipográfico se pedía.
3. Exportaciones íntegras y ordenadas de los tramos intermedios todavía no disponibles, incluidas sus respuestas y fechas. Los originales E01/E02 y los mensajes completos C/D ya están conservados; no hace falta volver a enviarlos.
4. Evidencia humana de revisión o cambios de integrantes si quieren acreditarlos. Una captura de aprobación o un pedido de continuar no demuestra revisión de código.

No se necesitan credenciales, cookies, audios privados ni datos de clientes para completar el registro. Si una exportación contiene esos valores, deben omitirse. Esta tarea continúa y entrega material útil sin bloquearse por esos faltantes.

## F. Bitácora histórica consolidada

Procedencia: `docs/entrega-2026/bitacora-ia.md`, [base 8ad5401](https://github.com/facumartea/dreams/blob/8ad5401fe0f2d0c3e501ab203f6ab37b27ff7db1/docs/entrega-2026/bitacora-ia.md). SHA-256 original: `5820af024fb83a510c6c97103951c507840b271a1a18cfa2020e7ade5f362db5`. Se integra su cuerpo, sin el título/banner de reenvío. Los encabezados se subordinan para mantener un único índice. No se transforman resúmenes en prompts literales.

**Lectura histórica:** las referencias a la rúbrica 2026, preentregas, fallos y mecanismos temporales describen esa etapa, no requisitos vigentes de 2025 ni instrucciones para repetirla. Las rutas de archivo que aparecen como texto pertenecen a su carpeta original. La discrepancia de fecha de 29ee9ea se explica en B02; no se corrige silenciosamente el antecedente. No hay revisión humana acreditada por añadir este registro.

Este registro identifica trabajo asistido por IA; no atribuye a los alumnos programación, revisión manual o dominio del código sin evidencia. Las fechas son las documentadas en commits y continuidad, no una reconstrucción de entregas de clase.

| Fecha acreditada | Prompt o resumen fiel | Resultado y evidencia | Revisión / cambios humanos acreditados |
|---|---|---|---|
| 2026-08-28 | Auditoría de arquitectura, seguridad y preparación de deploy | Entradas de `CHANGELOG.md`, separación de app y validaciones | No hay evidencia adjunta que permita atribuir cada cambio a un integrante. |
| 2026-10-27 | Continuar PR56, recuperar backend funcional y conservar oficial | Reconstrucción, pruebas locales/CI; deploy falló 401, rollback documentado | Usuario informó ajustes de Auth y carga de Secret. Resultado del Secret luego rechazado en uso; no equivale a una reparación exitosa. |
| 2026-10-28 | Diagnosticar bad_length sin exponer claves ni volver a configurar Auth | Sonda privada: espacios internos; HEAD directo/SDK401. `29ee9ea`, evidencia de credencial | Usuario autorizó reparación. No se acreditó reemplazo posterior. |
| 2026-10-28 | Continuar CI y minimizar intervención | `6f54b08` corrige qs; `2b8dcc1` prepara reparador y extracción de registro; CI209/360 PASS | No atribuir esos cambios de código a los alumnos. |
| 2026-10-29 | Priorizar conexiones existentes y una sola carga directa de Secret | `be57610`: continuidad; no dos tokens, no nueva publicación | Usuario pidió menor intervención. Carga directa todavía pendiente al inicio de esta tanda. |
| 2026-10-29 | Cerrar funcionamiento y preparar entrega según PDF2026, máximo40 líneas, wireframe, manual, BD, ZIP | Lectura del PDF original; inventario AST completo, refactorización, carrusel manual, confirmación de persistencia Admin y documentación de entrega | Trabajo de IA sujeto a pruebas; ver commit y resultados finales en `pruebas.md`. Integrantes deben revisar, corregir y defenderlo. |

### Historial que falta

La rúbrica pide bitácora **en cada preentrega** (previa el 2 de octubre). No se dispone de los prompts originales completos ni de una entrega fechada de esa preentrega. `CHANGELOG.md` y Git sirven como evidencia técnica parcial, no prueban asistencia, entrega en Classroom, participación ni revisión individual. Quedan pendientes los registros propios que posean los integrantes y la validación docente.

Para cada revisión futura registrar fecha, prompt fiel, salida aprovechada/descartada, defecto encontrado, prueba y cambio realizado, con autoría acreditada. No completar retrospectivamente como si hubiera ocurrido en clase.

### Aclaraciones recibidas el29/10/2026

El usuario respondió que el profesor aceptó Supabase, confirmó los apellidos **Martearena y Ruas** y pidió continuar las correcciones y subirlas a GitHub sin generar otro ZIP final. La IA actualiza documentación, matriz y footer con esa información. Se conserva la evidencia de extracción anterior y no se atribuye a los integrantes programación o revisión manual no acreditada.

### Reemplazo de clave informado y verificado ·29/10/2026

El usuario informó haber cambiado la clave servidor. La IA verificó la versión actualizada y ejecutó sonda privada acotada heredando ese Secret, sin leerlo: el nuevo valor todavía incluye espacios internos/controlASCII y no permite obtener respuesta HTTP válida; se retiró el Cron y se conservó la oficial restaurada. Se prepararon QA interna opt-in y guardas para no iniciar altas antes de lectura200. No se atribuye este código al alumnado ni se declara reparación o QA remota completada.

### Nueva copia válida y QA real · 29/10/2026

El usuario volvió a copiar la Secret key con el botón Copy y desplegó el Worker. La IA verificó el origen exacto de los bindings heredados y acreditó lectura directa/SDK200 sin transformar el valor ni mostrarlo. Una petición sintética del harness falló por faltar Content-Length; se reprodujo en workerd con fixture, se corrigió sólo el transporte y se aprobaron 398 tests/CI216. Registro, sesiones y parte del carrito pasaron realmente contra Supabase; la invocación larga alcanzó el límite Free de 50 subrequests. La IA dividió la QA en fases cortas con marcadores exclusivos de cuentas QA, sin cambiar el plan, Auth ni la cuenta Admin. Fuente `f2efb1d`, CI217/400 tests. La publicación y las fases restantes todavía no se acreditan en esta entrada. No hay revisión manual de alumnos acreditada para estos cambios.

### Auditoría real del Admin y regresión — 02/11 local, 03/11/2026 UTC

Solicitud: auditar y reparar todos los controles del Admin, conservar la oficial y no repetir pruebas acreditadas. La IA reprodujo el403 de guardado del backend legado y verificó ausencia de alta; corrigió el enrutamiento específico, readback y recuperación sin duplicados. Publicó únicamente la oficial. Detectó con un producto exclusivo QA la coerción stock:null→0 y la corrigió validando tipos antes de convertir;30 regresiones de tipos y476 tests totales pasaron. Prueba remota posterior400 conserva stockQA3. Registro y sesión web, renovación, errores recuperables, carrito, WhatsApp sin envío y checkout académico real pasan en Chromium oficial.

La contraseña Admin aportada como Secret se usa sólo dentro del Worker para login normal; sesión cifrada por KV privado y descifrada sóloRAM. Los incidentes del arnés se identifican como tales, no como defectos de Auth. La retirada del mecanismo/Secret y el resultado del resto de casos se documentan al cierre; no se anticipan aquí. No hay revisión manual ni programación de los alumnos acreditada para estas correcciones.

Cierre acreditado:89casos remotos distintos PASS, nueve fases privadas PASS/281assertions y476tests. Retirados SecretAdmin/Cron/KV/mecanismo; logout real y guardado/imágenes comprobados sobre backend final limpio. Documentación final/manualPDF actualizados por IA. Usuario pidió continuar hasta terminar sin repetir procesos; no se ejecutó de nuevo la QA ya aprobada ni se generó ZIP final.

## G. Simplificación del repositorio · 11/11/2026

- Fecha comprobable: 11/11/2026, solicitud actual y fecha de esta ejecución.
- Tipo: prompt original completo disponible; no es una reconstrucción de etapas anteriores.
- Objetivo: conservar ejecución y entrega académica, consolidar el registro y preparar una lista de excepciones antes de borrar archivos necesarios.
- Resultado: bitácora histórica consolidada en F; navegación e instalación repetidas trasladadas a README. Inventario y decisiones en `docs/limpieza-20261111.json`. PR de esta branch, sin integrar ni desplegar mientras falte decisión sobre excepciones.
- Pruebas del agente: base CI254 reutilizada; sintaxis e inventario antes de cambiar. Instalación limpia, tests, builds y enlaces posteriores se acreditan en el JSON con sus resultados reales, sin asumirlos por anticipado.
- Revisión humana: decisiones de excepciones pendientes. No se atribuye al alumnado revisión de código o dominio del proyecto.

```text
Quiero simplificar al máximo el repositorio de DREAMS sin romper la aplicación
ni perder documentos necesarios para la entrega.

REPOSITORIO
https://github.com/facumartea/dreams

OFICIAL
https://dreams-perfumes.pages.dev/

ESTRUCTURA DESEADA
Conservar principalmente:
- Código JS/MJS/CJS, JSON, HTML, CSS y Python si realmente existe y se utiliza.
- README.md.
- Un único Markdown de declaración y registro de prompts.

Quiero retirar documentación operativa de IA, prompts de continuidad,
planes obsoletos, duplicados y archivos innecesarios.

IMPORTANTE
No uses la extensión como único criterio.
Si un archivo fuera de esa lista es necesario para ejecutar, instalar,
probar, publicar, conservar datos o cumplir la rúbrica, NO lo borres:
explicame su función y pedime una decisión.

1. ANALIZAR ANTES DE BORRAR
Leé las instrucciones aplicables y revisá Git, PRs y cambios locales.
Partí de la versión vigente, preservando trabajo ajeno.
Creá una branch específica de limpieza.

Inventariá archivos y comprobá referencias en:
- Imports.
- HTML, CSS y JavaScript.
- package.json y scripts.
- CI de GitHub.
- Configuración y build de Cloudflare.
- Migraciones y esquema.
- Tests.
- Documentación e índices.

No borres carpetas enteras sin revisar su contenido.
No incluyas archivos nuevos de otras tareas en la limpieza.

2. DECLARACIÓN DE PROMPTS
Consolidá en un único Markdown la declaración de uso de IA y el registro
de prompts disponibles.

Preservá contenido único de las bitácoras antes de retirar duplicados.
Identificá extractos, resúmenes y datos faltantes.
No inventes prompts, fechas, resultados o revisión humana.
No incluyas secretos ni datos privados.

La limpieza debe mejorar organización, no ocultar el uso de IA.

3. ELIMINACIONES AUTORIZADAS
Podés retirar, después de comprobar que no tienen dependencias ni información
única necesaria:
- Prompts operativos de continuidad ya obsoletos.
- Planes descartados.
- Archivos temporales o generados innecesariamente versionados.
- Duplicados exactos.
- Documentación repetida cuyo contenido vigente ya esté consolidado.

No reescribas el historial de Git.
No elimines evidencia única o documentos exigidos por la rúbrica.

4. EXCEPCIONES: CONSULTARME ANTES
Prepará una única lista agrupada con los archivos que no cumplen mi lista
de extensiones pero conviene conservar.

Revisá especialmente:
- Imágenes, logos, iconos y fuentes utilizados.
- SQL y migraciones.
- pnpm-lock.yaml y pnpm-workspace.yaml.
- Workflows YAML.
- Configuraciones Wrangler JSONC/TOML.
- .gitignore y otros archivos de herramientas.
- AGENTS.md y su alcance.
- robots.txt y sitemap.xml.
- Manual, wireframe, D.E.R., rúbrica y documentos académicos.
- Licencias y atribuciones.
- Configuración histórica cuya necesidad no esté clara.

Para cada excepción indicá:
- Archivo o grupo.
- Para qué sirve.
- Qué se rompería o perdería al retirarlo.
- Si existe una alternativa segura.
- Recomendación.

No borres estos archivos hasta que responda.
Diferenciá “no lo exige la rúbrica” de “no lo necesita la aplicación”.

No agregues Python ni conviertas código a otro lenguaje para cumplir
una lista de extensiones.
No renombres archivos de configuración a extensiones incorrectas.

5. VALIDAR LA LIMPIEZA
Establecé una base de checks antes de cambiar, reutilizando evidencia vigente.
Después:
- Actualizá referencias de archivos retirados.
- Comprobá enlaces del README.
- Ejecutá sintaxis, tests pertinentes y builds.
- Verificá instalación reproducible.
- Conservá el límite de 40 líneas por función.
- Revisá ausencia de secretos.

No retires tests para que el proyecto parezca más pequeño.
Si una eliminación produce un fallo, restaurá el archivo e informá la causa.

6. GITHUB Y OFICIAL
Prepará commit, push y PR revisable.
No hagas merge mientras haya excepciones pendientes de mi decisión.

Esta tarea no autoriza modificar funcionalidades, datos, Auth, credenciales
ni configuración de producción.

Si solo se elimina documentación, no despliegues la web.
Si una modificación afecta al artefacto publicado, explicá su impacto
y las verificaciones necesarias antes de publicar.

No modifiques otros sitios ni previews.

ENTREGA
- Árbol propuesto del repositorio.
- Archivos eliminados y justificación.
- Archivos consolidados.
- Lista de excepciones que necesitan mi decisión.
- Resultado de checks y builds.
- Branch y PR.
- Confirmación de que no se modificó la oficial.

El objetivo no es borrar la mayor cantidad posible:
es dejar únicamente lo necesario, con las excepciones que yo apruebe.
```

## H. Raíz con sólo README y reducción de carpetas · 10/11/2026 local

- Fecha: 10/11/2026, contexto horario del usuario en Buenos Aires. La branch usa 20261111 por la fecha UTC inicial; no se cambia ese nombre para aparentar otra etapa.
- Prompt original completo disponible: «reduci todo lo  mas posible de esta imagen tiene que quedar solo el reedme y de las carpetas reduci lo mas posible». La captura muestra archivos de la raíz; no se inventa contenido adicional de ella.
- Objetivo: reducir archivos visibles en la raíz y documentación repetida sin romper instalación, publicación futura ni entrega.
- Resultado: proyecto ejecutable en app/; raíz con README y carpetas app/, docs/, .github/. Históricos consolidados en cuatro HTML sin JavaScript, con contenido original verificable. Dos duplicados exactos unificados preservando sus procedencias como alias. Configuración necesaria, tests, migraciones, material académico, capturas únicas y fuentes editables conservados.
- Evidencia: PR64 y second_phase de docs/limpieza-20261111.json. No se modifica la oficial ni se ejecuta publicación por la reorganización.
- Pruebas del agente: registrar instalación limpia, regresiones, límite40, builds, integridad de archivos movidos y contenido histórico en second_phase.checks; no atribuir QA remota nueva a estas pruebas.
- Revisión humana: esta solicitud autoriza la reducción. No acredita revisión de código ni dominio de los integrantes.

## I. Retirar rúbricas y sobrantes de la carpeta mostrada

- Fuente: solicitud posterior a la integración de PR64, acompañada de capturas de docs/entrega-2026. No se reconstruye una fecha no confirmada del mensaje.
- Prompt original completo disponible: «aca en esta captuira tambien retirar todo lo que no este en la rubrica los archivos de la rubrica retirarlos tambien solo dejar wireframe y lo que pide la rubrica esos dos de la imagen retirar tambien».
- Objetivo: dejar en esa carpeta documentación de entrega, sin copias de las consignas ni reportes de control sobrantes.
- Resultado: se conservan manual Markdown/PDF, API, wireframe PNG/SVG y la captura usada por el manual; se retiran seis reportes/esquemas antiguos, tres capturas sin uso y las cuatro copias PDF/TXT de las rúbricas 2025/2026. El D.E.R. actual, su diccionario y fuentes permanecen en docs/auditoria-2025. Aplicación, SQL, configuración y otros documentos de estudio/entrega no se modifican.
- Evidencia: branch docs/entrega-sin-reportes-ni-rubricas y PR de esta limpieza. Referencias de navegación actualizadas; inventarios/archivos históricos se mantienen como fotografías de sus commits, sin reescribirlos como si fueran la lista actual.
- Pruebas del agente: lectura del PDF 2025 antes de retirarlo; revisión de consumidores, enlaces Markdown y Word/PDF, conservación del D.E.R./manual y build Pages comparado con el artefacto anterior. CI según los checks de la PR. No es QA remota nueva y no hay deployment.
- Revisión humana: el usuario autoriza explícitamente la retirada indicada. No se acredita revisión de código ni participación por esa autorización.

## J. Entrega mínima sin capturas · 11/11/2026

- Prompt original completo: «saca este (capturas) y de las otras fotos retirar todos los archivos posibles». Capturas adjuntas de docs/ y app/ utilizadas como referencia de alcance.
- Objetivo: retirar capturas y reportes de trabajo, reunir documentos de entrega y eliminar utilidades no utilizadas sin romper ejecución, pruebas o publicación.
- Resultado: documentación reunida en docs/, con wireframe/mapa y D.E.R. en sus carpetas. Manual sin capturas; guía de defensa y registro de IA conservados. Los metadatos estructurales de BD se reúnen en un solo esquema JSON. Se retiran reportes de auditoría/limpieza, copias históricas y pseudocódigo de favoritos obsoleto; wireframe satisface la alternativa documental. Las pruebas existentes no se eliminan. Se retiran el CLI antiguo grant-google-admin.js y el template gráfico social-card.html, sin consumidores en aplicación/build/tests; no se ejecuta la herramienta de roles.
- Evidencia: branch refactor/entrega-minima-sin-capturas y PR de esta tarea. Los textos originales siguen en Git; enlaces históricos usan el commit de origen y no inventan hechos actuales.
- Pruebas del agente: revisión de consumidores, rutas de documentos, esquema y 46 endpoints; prueba del inventario --write sin .git; instalación limpia, checks, tests y builds según resultados de la PR. No se atribuye nueva QA remota ni revisión humana. No hay deployment ni cambios de Auth/credenciales/datos.

## Antecedentes de seguridad conservados

Los tres textos siguientes son resultados técnicos históricos que acompañan el registro de IA, **no prompts originales ni instrucciones vigentes**. Se conservan para no descartar hallazgos únicos al retirar las carpetas de históricos. No prueban vulnerabilidades vigentes ni que el alumnado haya programado o revisado esas correcciones. Sus fechas y límites son los originales. El resto del historial permanece accesible por los commits citados en este registro. Sólo se normalizan espacios finales para el formato Markdown.

### AUDIT.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
> Actualización verificada 2026-10-06: estado vigente en CURRENT_STATE.md; evidencias y límites nuevos en [docs/cloudflare_validation.md](https://github.com/facumartea/dreams/blob/6167f35c69ef83b680b8188349a51bd95af3e05a/docs/cloudflare_validation.md), arquitectura/publicación/rollback en [docs/cloudflare_migration.md](https://github.com/facumartea/dreams/blob/6167f35c69ef83b680b8188349a51bd95af3e05a/docs/cloudflare_migration.md). Destino actualizado a Cloudflare por instrucción del usuario; no deploy remoto ni cambio DNS. El contenido siguiente conserva historia y no reemplaza las verificaciones nuevas.

## Revalidación de continuidad — 2026-10-05

Esta sección prevalece sobre las instantáneas históricas que siguen. Repositorio facumartea/dreams, main base 4655b0c; PR #33 sin fusionar. Código y documentación recuperados del SHA base por GitHub; estructura completa inventariada, ramas y commits recientes contrastados. No se inició una aplicación nueva.

| Área | Estado comprobado / límite |
|---|---|
| Frontend | HTML/CSS/JS multipágina, assets de marca y paletas existentes; sin cambios visuales |
| Backend/API | Express 5; factory inyectable; catálogo, marcas, cotización, auth, reviews, consultas, checkout y Admin |
| Auth | Supabase Auth, cookies HttpOnly y refresh, roles en profiles; falta QA real/recuperación/MFA |
| DB | Supabase ACTIVE_HEALTHY, 7 tablas con RLS; 46 productos, 7 perfiles, 1 consulta; otras tablas vacías |
| Esquema | products.marca real frente a brand del código anterior; corregido en límite DB, sin DDL |
| Productos/imágenes | image_url presente en los 46 productos; carga de cada imagen no verificada |
| Carrito | cotización server-side de precio/stock; regresión marca y suite HTTP verdes en CI |
| Checkout/pedidos | demo y Mercado Pago existentes; orders vacía, no se generó compra falsa; cobros Sandbox/E2E pendientes |
| Reviews | modelo general, tabla vacía; cobertura aislada existente; no inventar opiniones |
| Favoritos | retirado previamente, redirecciones conservadas, tabla vacía intacta |
| Cupones | CRUD/cálculo/snapshots existentes y cobertura aislada; tabla vacía, límites/concurrencia pendientes |
| Admin | JWT y RLS existentes; create/update marca probado en DB aislada; sin mutaciones reales |
| Dependencias | CI inicial: 7 avisos, 1 crítico; lock de proxy-addr/morgan/ip-address actualizado; audit final limpio |
| Scripts/build | start/dev/check/test/ci, sin script build; check 29 JS verde |
| Git | rama codex/restore-schema-continuity, PR #33; main intacta, sin force-push |
| CI | run 37403358659 SUCCESS en a20bfcd; frozen install/audit/check y 81/81 tests, cero omitidos |
| Deployment | railway.toml existente; dominio documentado devuelve 404 Railway Application not found; sin acceso conectado |
| Responsive/QA | seis viewports, consola, accesibilidad, performance y QA autenticado real pendientes |

Arranque anterior ejecutaba seed/provisioning automático. Se retiró esa llamada: los reinicios ya no insertan catálogo histórico ni promueven perfiles Admin. seed.js permanece como referencia histórica, fuera del arranque.

No se modificaron productos, precios, imágenes, usuarios, pedidos, cupones, opiniones, políticas o schema remotos. Lecturas SQL verificaron el esquema y que las proyecciones con marca leen 46 filas. Las tablas orders/coupons tienen grants authenticated limitados, protegidos por policies Admin; anon no tiene grants en esas dos tablas.

Advisors: [contraseñas filtradas desactivadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) y [helper SECURITY DEFINER callable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). El helper verifica auth.uid()/rol y usa search_path vacío; revocar su permiso sin pruebas rompería policies.

Avisos corregidos: [proxy-addr](https://github.com/advisories/GHSA-jqcg-44mw-7w3h), [morgan](https://github.com/advisories/GHSA-9f6g-j8ch-79g4), [ip-address](https://github.com/advisories/GHSA-h3mg-xc3c-68pw), más los otros cuatro avisos reportados por audit de CI en estos mismos paquetes.

Bloqueo concreto de cierre: conectar Railway o identificar dominio activo, recuperar deployment existente sin cambiar proveedor, desplegar código validado y ejecutar smoke/E2E. No declarar el e-commerce listo para ventas reales mientras pagos, inventario/concurrencia y QA integral no se verifiquen.

---

# Auditoría F0 — DREAMS

Fecha de corte: 2026-08-28. Base auditada: `f3533d7fd0efc653eb39a1cfc8b0f39656068254` (`main`).

## Resumen ejecutivo

DREAMS es un proyecto académico migrado parcialmente de SQLite a Supabase. Tiene una tienda catálogo visualmente coherente, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas por WhatsApp y un panel Admin. La arquitectura es pequeña y recuperable, pero no está lista para producción.

Los principales bloqueos son XSS almacenado/DOM por renderizado inseguro, un seed que puede sobrescribir datos administrados en cada arranque, un healthcheck que informa éxito sin base de datos, edición Admin rota, dependencia vulnerable sin uso, ausencia total de tests/CI y documentación contradictoria.

## Estado real por área

### Funciona con evidencia local

- Instalación reproducible con `pnpm install --frozen-lockfile`.
- Sintaxis válida en todos los archivos JavaScript.
- Arranque HTTP con variables de entorno sintácticamente válidas.
- Archivos estáticos, `/api/health`, `/api/auth/me`, fallback frontend y 404 API respondieron localmente.
- Catálogo, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas y Admin tienen implementación real en código.
- Supabase usa RLS en todas las tablas declaradas y constraints básicos de FK/rangos.
- Cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción; Helmet y rate limit de Auth están presentes.
- Railway y lockfile están versionados.

### Funciona a medias

- Healthcheck: responde `200 {status:"ok"}` aunque Supabase no resuelva.
- Auth: guarda access y refresh token, pero nunca usa el refresh; la sesión cae al vencer el access token.
- Registro: crea el perfil desde el servidor, pero ignora el error del `upsert`; puede dejar una cuenta sin perfil.
- Admin: listar, crear y borrar existen; editar está roto porque el formulario no recibe `product-id`.
- Usuarios Admin: el endpoint devuelve siempre `email:null`, por lo que la tabla muestra `null`.
- Carrito: es una selección local para consulta, no un checkout. Precio, stock y datos pueden quedar obsoletos o manipularse en `localStorage`.
- Responsive: hay breakpoints y tablas desplazables, pero no existe evidencia de QA en los viewports requeridos.
- SEO: sólo la portada tiene description; faltan canonical, OpenGraph, sitemap, robots y datos estructurados.

### Roto o riesgoso

- El seed hace `upsert` destructivo de las 31 filas en cada arranque y restaura productos borrados.
- Datos de productos, reseñas, perfiles, consultas y carrito se interpolan en `innerHTML` sin escape.
- El frontend deshabilita el outline de campos sin proveer un foco visible equivalente.
- La carga de reseñas y varios fetch no validan `response.ok` ni tienen estado de error consistente.
- La cantidad del carrito puede superar el stock; no se reconcilia contra servidor.
- El menú móvil no expone `aria-expanded`, no cierra con Escape y no conserva un estado accesible.
- Las políticas SQL no son reejecutables: `create policy` falla si ya existe. No hay migraciones versionadas.

### Simulado, obsoleto o no demostrado

- README y documentación todavía afirman SQLite, bcrypt, express-session, `SESSION_SECRET`, volumen Railway y una API de cotización inexistente.
- No hay pagos, órdenes, checkout transaccional, uploads ni storage; no deben presentarse como terminados.
- No hay pruebas, lint, typecheck, build, CI, PR ni QA documentado.
- El estado del proyecto Supabase, Railway, dominio y logs no pudo verificarse sin acceso a esos servicios.
- La API de GitHub no fue accesible sin autenticación; el remoto Git sí pudo clonarse. Estado de PR/deploy remoto: no verificado.

## Hallazgos por severidad

### Críticos

1. **XSS almacenado/DOM:** datos controlables desde reseñas, perfil y Admin se insertan con `innerHTML`. Un comentario como markup ejecutable puede afectar visitantes y el panel Admin. Evidencia: `public/js/app.js`, `producto.js`, `cuenta.js`, `admin.js`, `carrito.js`.
2. **Integridad de catálogo:** `seed_database` sobrescribe los productos por `(brand,name)` en cada arranque y resucita eliminados. Cambios de precio, stock, imagen y descripción hechos por Admin no son persistentes como fuente de verdad.

### Altos

1. **Healthcheck falso positivo:** `/api/health` y el healthcheck Railway en `/` no comprueban Supabase.
2. **Edición Admin rota:** `fill_form` no asigna `product-id`; guardar intenta un POST y choca con el unique `(brand,name)`.
3. **Dependencia vulnerable:** `nodemailer` 7.0.13, además sin uso, produce 1 vulnerabilidad alta, 4 moderadas y 1 baja en `pnpm audit --prod`.
4. **Sin testing ni CI:** no existe una barrera automática contra regresiones de seguridad, auth, datos o Admin.
5. **Sesión incompleta:** el refresh token queda en cookie pero no se utiliza ni revoca en Supabase al hacer logout.
6. **Spam/abuso:** `/api/inquiries` es público y no tiene rate limit específico; permite escrituras ilimitadas con una clave privilegiada del servidor.
7. **Autorización dependiente de perfil:** fallar silenciosamente al crear `profiles` deja estados inconsistentes; no hay trigger DB que garantice el perfil.

### Medios

- Validación de producto acepta `NaN`, infinitos, decimales en stock/tamaño/intensidad y URLs no HTTP(S); longitudes no se limitan.
- IDs inválidos llegan como `NaN` a Supabase en varios endpoints.
- Toggle de favoritos es read-then-write, no atómico ante concurrencia.
- Errores de Supabase se devuelven textualmente en altas/ediciones Admin.
- Carrito no limita cantidad a stock ni refresca precio/stock desde la API.
- Consulta de carrito no incluye su contenido y usa WhatsApp hardcodeado, ignorando `/api/config`.
- CSP está desactivada; faltan política de orígenes para imágenes/fuentes y controles adicionales.
- El borrado de producto es permanente para relaciones de favoritos; falta estrategia de archivo/auditoría.
- Falta índice para orden de reseñas y una estrategia de búsqueda escalable; no existe trigger de `updated_at`.
- No hay migraciones/seeds separados por entorno ni prueba de RLS contra roles reales.
- Estados loading/error/empty son inconsistentes; varias promesas no capturan errores.
- El CSS elimina foco visible en inputs/selects/textarea; botones y tabs necesitan semántica/estado accesible.
- No hay `prefers-reduced-motion`.
- Imágenes externas dependen de Unsplash y no tienen dimensiones declaradas, `srcset` ni política de licencia resuelta para producción.

### Bajos

- Código servidor concentrado y minificado en un solo archivo dificulta pruebas y mantenimiento.
- Cabecera y footer están duplicados en todas las páginas.
- Fuentes declaradas y fuentes realmente cargadas no coinciden (`Playfair Display`/`Montserrat` no se solicitan).
- Fallback SPA devuelve portada con 200 para rutas frontend inexistentes (soft 404).
- Descripciones meta ausentes fuera de portada; falta favicon/manifest.
- Documentación y comandos (`npm run seed`) no coinciden con `package.json`.

## Datos y Supabase

- Tablas: `profiles`, `products`, `favorites`, `reviews`, `inquiries`.
- FKs y checks básicos: presentes.
- RLS: habilitado en las cinco tablas. Lectura pública sólo para productos/reseñas; perfil/favoritos por propietario. Las escrituras normales pasan por servidor con clave secreta.
- Riesgo principal: al usar `SUPABASE_SECRET_KEY`, todos los permisos dependen del servidor; cualquier endpoint débil omite RLS como defensa efectiva.
- No se detectó secreto real versionado.
- No se pudo ejecutar advisor, consultar esquema remoto ni verificar políticas efectivas por falta de conexión/credenciales Supabase.

## Testing y verificaciones F0

- `pnpm install --frozen-lockfile`: OK.
- Política de supply chain del lockfile: OK.
- `node --check` en servidor y frontend: OK.
- Smoke local sin DB real: 200 en `/`, `/api/health`, `/api/auth/me`; 404 correcto en API inexistente.
- `pnpm audit --prod`: FALLA, 6 vulnerabilidades vía `nodemailer`.
- Unit/integration/E2E: no existen.
- Browser QA, responsive, accesibilidad automatizada, CI y producción: no ejecutados.

## Riesgos de deploy

- Railway puede considerar sana una instancia con Supabase caído.
- Seed destructivo en cada reinicio/deploy.
- No hay pin explícito de versión Node más allá de `>=20`.
- No hay CI previo al deploy ni migraciones automatizadas/registradas.
- Dominio, variables, logs y persistencia remotos no verificados.

## Conclusión

La base es rescatable y el alcance comercial actual es una tienda catálogo con consultas, no un e-commerce transaccional. La prioridad correcta es contener XSS y pérdida de datos, reparar Admin/health/auth y construir pruebas/CI antes de cambios visuales.
````

### SECURITY_ADVERSARIAL_2026-09-01.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
# Auditoría adversarial autorizada — DREAMS

Alcance: revisión no destructiva de Auth, autorización, sesiones, Supabase/RLS, API, checkout demo, cupones, pedidos, inputs, headers, secretos y rate limits. No se realizó DoS, acceso a cuentas ajenas, borrado de datos, persistencia maliciosa ni obtención de credenciales.

## Resumen

- Críticos: 0
- Altos: 0
- Medios: 2
- Bajos: 1
- Informativos: 2
- Corregidos en esta tanda: 3

## Hallazgos

### MEDIO — Enumeración parcial mediante confirmación pendiente

- VULNERABILIDAD: el login diferenciaba `email_not_confirmed` de credenciales incorrectas.
- COMPONENTE: `POST /api/auth/login`.
- IMPACTO: permitía inferir que un correo estaba registrado y pendiente de confirmar.
- CONDICIONES: proveedor devolviendo ese código y confirmación habilitada.
- PRUEBA SEGURA REALIZADA: prueba de integración con respuesta simulada del proveedor.
- CORRECCIÓN: en modo demo el mensaje es siempre `Correo o contraseña incorrectos.`.
- REGRESSION TEST: `modo demo no enumera usuarios mediante errores de confirmación`.
- ESTADO: CORREGIDO.

### MEDIO — Carrera al resolver dos veces un pedido demo

- VULNERABILIDAD: dos solicitudes simultáneas podían leer `created` antes de que una actualizara el pedido.
- COMPONENTE: `POST /api/checkout/demo-payment`.
- IMPACTO: estado demo no determinístico y segundo procesamiento innecesario.
- CONDICIONES: mismo usuario, mismo pedido y solicitudes concurrentes.
- PRUEBA SEGURA REALIZADA: revisión de la secuencia read-then-update; no se generó carga concurrente en producción.
- CORRECCIÓN: actualización compare-and-set con `id` y `status = created`; una segunda resolución devuelve 409.
- REGRESSION TEST: invariantes de estado cubiertas por suite de checkout y revisión de consulta condicionada.
- ESTADO: CORREGIDO.

### BAJO — Mutación autenticada sin origen explícito

- VULNERABILIDAD: una mutación con cookie podía continuar si faltaban `Origin`, `Referer` y `Sec-Fetch-Site`.
- COMPONENTE: guard global de mutaciones.
- IMPACTO: defensa CSRF menos estricta en clientes que omiten metadata.
- CONDICIONES: solicitud con cookie de DREAMS y sin headers de origen.
- PRUEBA SEGURA REALIZADA: integración local con cookie ficticia.
- CORRECCIÓN: las mutaciones con cookies DREAMS ahora exigen origen/referer válido.
- REGRESSION TEST: `una mutación autenticada sin Origin ni Referer se rechaza`.
- ESTADO: CORREGIDO.

### INFORMATIVO — Confirmación de correo desactivada para demo

- COMPONENTE: registro.
- IMPACTO: cuentas de prueba se activan sin demostrar control del buzón.
- CONDICIONES: `DEMO_AUTO_CONFIRM_EMAIL=true`.
- CONTROL: alta server-side, rol forzado a `customer`, passwords, rate limit, cookies, autorización y RLS permanecen activos.
- ESTADO: ACEPTADO SÓLO PARA DEMO. Antes de venta real: variable en `false` y `Confirm email` habilitado en Supabase Auth.

### INFORMATIVO — Advisor de Supabase

- RLS está activo en todas las tablas públicas.
- `orders`, `coupons` e `inquiries` no tienen policies públicas porque son server-only y se revocaron privilegios de `anon`/`authenticated`.
- Protección de contraseñas filtradas continúa desactivada; requiere habilitación desde Auth cuando el plan del proyecto la permita.
- Remediación oficial: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Controles verificados

- Precios, stock, cantidades, descuento y total se recalculan en servidor.
- Porcentaje del cupón no proviene del cliente.
- Pedidos se consultan por `id` + `user_id`.
- Admin depende del rol almacenado en `profiles`, no de `user_metadata`.
- Tablas de pedidos/cupones mantienen RLS y grants server-only.
- Payload de tarjeta demo es rechazado por el servidor.
- CSP no permite `unsafe-inline`; framing, MIME sniffing y downgrade HTTPS tienen cabeceras defensivas.
- Rate limits separados para Auth, checkout, cupones, carrito, consultas, opiniones y webhook.
- Audit de dependencias de producción: cero vulnerabilidades conocidas.
````

### SECURITY_REVIEW_2026-08-29.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
# Revisión de seguridad y plan de mejora — DREAMS

Fecha de corte: 2026-08-29
Alcance: repositorio, API Express, Supabase/Postgres, autenticación, Admin, frontend público, Railway y requerimientos visuales nuevos.
Entorno revisado: producción en `https://drams-production.up.railway.app` y código del commit `08e15128ca28fe6742536043a7de8b90c2d82ede`.

## Límites de esta revisión

- Se inspeccionó código, configuración, esquema, políticas RLS, advisors, dependencias, respuestas HTTP y estado del deploy.
- No se ejecutaron ataques destructivos, carga intensiva, modificación de datos reales ni pruebas con una cuenta Admin real.
- No se leyeron ni copiaron valores secretos. La revisión sólo confirmó nombres, alcance y uso de variables.
- Esta tanda documenta y prioriza. No cambia todavía datos, dominio, variables ni producción.

## Arquitectura real

- Frontend multipágina en HTML, CSS y JavaScript sin framework.
- Backend Node.js 24 con Express 5.
- Supabase Auth y Postgres como fuente de verdad.
- El navegador usa cookies `HttpOnly`; la clave privilegiada de Supabase queda en el servidor.
- Railway construye y despliega `main`; `/api/health` comprueba API y base de datos.

## Controles que ya están bien implementados

- `helmet` con CSP restrictiva, HSTS, `nosniff`, bloqueo de framing y política de referrer.
- Cookies `HttpOnly`, `Secure` en producción y `SameSite=Lax`; respuestas de auth con `no-store`.
- Validación server-side de credenciales, IDs, cantidades, precios, stock, longitudes y URLs.
- Salida dinámica escapada y URLs de imagen limitadas a HTTPS o assets locales.
- Roles obtenidos desde `profiles`, no desde metadatos editables del usuario.
- Endpoints Admin protegidos por sesión y rol.
- Rate limits específicos para auth, consultas y carrito.
- RLS activo en todas las tablas públicas.
- Dependencias de producción sin vulnerabilidades conocidas en `pnpm audit` al momento de la revisión.
- Errores públicos genéricos y logs reducidos que no copian respuestas internas del proveedor.

## Hallazgos priorizados

No se confirmó una vulnerabilidad crítica explotable durante esta revisión. Eso no significa riesgo cero: faltan pruebas autenticadas y de abuso controlado.

### Altos

1. **Ciclo de vida del usuario Admin ligado al arranque.** `seed.js` busca/crea el Admin desde variables de Railway cada vez que inicia el servidor. No resetea una contraseña existente, pero mezcla una tarea privilegiada de una sola vez con el arranque normal. Debe separarse en un comando manual y auditable.
2. **Falta una segunda barrera para operaciones Admin.** No hay MFA, reautenticación reciente ni auditoría de cambios. El impacto de una sesión Admin robada sería alto, especialmente porque el borrado de productos es permanente.

### Medios

1. **No hay verificación explícita de `Origin`/`Referer` en mutaciones con cookie.** `SameSite=Lax` reduce gran parte del CSRF, pero no sustituye una política explícita y testeada; también queda el caso de login CSRF.
2. **Permisos SQL demasiado amplios para `anon` y `authenticated`.** Las tablas públicas tienen grants generales y RLS evita hoy el acceso indebido. Conviene revocar por defecto y conceder sólo los `SELECT` realmente públicos, como segunda barrera.
3. **El email de acceso Admin se expone públicamente.** `/api/config` devuelve `admin_email`. El contacto público y el identificador de administración deben ser variables distintas.
4. **Opiniones sin flujo completo de publicación y moderación.** La API ya persiste opiniones autenticadas y la tabla existe, pero falta el formulario público, política de duplicados/edición, rate limit específico, moderación Admin y pruebas de persistencia después de recargar.
5. **Borrado permanente de productos.** Puede romper referencias históricas y no deja auditoría. Debe reemplazarse por archivado, salvo borrado excepcional y confirmado.
6. **Seguridad de cuenta incompleta.** Falta recuperación de contraseña, configuración de redirects/SMTP, pruebas E2E de refresh/logout y protección reforzada del Admin.
7. **Protección contra contraseñas filtradas desactivada.** El advisor de Supabase lo marca como advertencia. Debe habilitarse si el plan contratado lo permite; si no, documentar la limitación y compensar con MFA Admin y política de contraseñas.

### Bajos

1. La tabla histórica `favorites` permanece vacía y protegida aunque la función fue retirada. No es una exposición activa, pero agrega superficie innecesaria.
2. Rutas públicas inexistentes pueden terminar en el fallback de `index.html` con 200 en vez de 404, perjudicando observabilidad y SEO.
3. Falta una política documentada de rotación de secretos, respuesta a incidentes y revisión periódica de logs/advisors.
4. No existen tests de integración contra Supabase usando roles `anon`, `authenticated` y servidor privilegiado.

## Estado de las opiniones

La persistencia base **ya existe**:

- `GET /api/reviews` lee `public.reviews`.
- `POST /api/reviews` exige sesión, valida una puntuación de 1 a 5 y un comentario de hasta 1000 caracteres, y guarda usuario, nombre, puntuación y comentario.
- Una publicación anónima fue rechazada correctamente con HTTP 401.
- En producción hay 0 opiniones actualmente.

Lo que falta es la experiencia pública para escribirlas y administrarlas. La implementación recomendada es:

1. mostrar el formulario sólo con sesión iniciada y un CTA de login para visitantes;
2. enviar por la API del servidor, nunca insertar directamente desde el navegador;
3. bloquear doble envío y mostrar estados accesibles de carga, éxito y error;
4. volver a pedir `GET /api/reviews` después del alta para confirmar lo persistido;
5. agregar un límite por usuario e IP;
6. permitir editar la opinión propia;
7. agregar estado `pending`, `published` o `rejected` y moderación Admin;
8. definir si cada opinión es general o pertenece a un producto. La recomendación para ecommerce es una opinión por usuario y producto, editable.

No se debe habilitar una policy pública amplia de `INSERT`: las escrituras deben continuar pasando por el servidor.

## Plan de trabajo por fases

### S0 — Baseline y pruebas de seguridad

- Congelar evidencia actual, añadir matriz de amenazas y casos de abuso.
- Crear tests de `Origin`, CSRF, sesión, roles, errores y límites.
- Añadir integración controlada de RLS con las tres clases de cliente.

**Cierre:** baseline reproducible, tests verdes y ninguna modificación remota.

### S1 — Frontera HTTP y autenticación

- Middleware central para validar `Origin` en todas las mutaciones.
- Mantener cookies seguras y probar renovación, revocación y expiración.
- Separar `CONTACT_EMAIL` de `ADMIN_EMAIL`; retirar `admin_email` de `/api/config`.
- Implementar recuperación de contraseña con redirects permitidos y mensajes no enumerables.
- Preparar MFA obligatorio para Admin y reautenticación para acciones sensibles.

**Cierre:** pruebas de auth/CSRF verdes, cuenta recuperable y ningún dato Admin expuesto públicamente.

### S2 — Supabase y privilegios mínimos

- Migración no destructiva para revocar grants generales.
- Conceder sólo `SELECT` necesario a `products`, opiniones publicadas y perfil propio.
- Mantener `inquiries` y todas las escrituras bajo servidor privilegiado.
- Separar el provisioning Admin del arranque y documentar rotación/revocación.
- Revisar advisors después de la migración.

**Cierre:** migración versionada, prueba de rollback, RLS/grants verificados y advisors revisados.

### S3 — Opiniones persistentes y moderadas

- Definir relación opinión-producto y regla de duplicados.
- Añadir schema de estado/moderación e índices necesarios.
- Crear formulario editorial coherente, edición propia y recarga desde DB.
- Añadir rate limit y panel Admin para aprobar/rechazar/ocultar.
- Probar alta, reload, edición, duplicado, sesión expirada, abuso y XSS.

**Cierre:** opinión persiste tras recargar, sólo aparece según la regla de moderación y Admin puede gestionarla sin borrar historial.

### S4 — Admin y protección de datos

- Reemplazar delete normal por archive/restore.
- Requerir confirmación fuerte y sesión reciente para operaciones destructivas.
- Crear audit log mínimo para productos, roles y opiniones.
- Completar búsqueda, filtros, loaders y errores sin filtrar datos sensibles.

**Cierre:** CRUD seguro, reversible y auditado con E2E de customer/Admin.

### D1 — Contacto, colección femenina e imagen principal

- Cambiar contacto a `[DATO PERSONAL OMITIDO]` mediante `CONTACT_EMAIL` y enlaces `mailto:` en todas las páginas.
- Para `catalogo.html?gender=mujer`, usar título **Perfumes de mujer**, eyebrow **Colección femenina** y metadata específica.
- Mantener negro, marfil y champagne; sumar sólo en esa cabecera un matiz rosa viejo/taupe cálido muy controlado, luz más suave y composición editorial. No cambiar cards, filtros ni identidad global.
- Recrear el frasco DREAMS desde cero en alta resolución. La referencia actual es 684×1020 y el asset usado por la web es apenas 185×272, por eso se pixela al ampliarlo.
- Crear un master vertical de al menos 2048×3072 y derivados AVIF/WebP de 640, 960 y 1440 px, con `srcset`, dimensiones declaradas y fallback.
- Para evitar texto deformado por generación, producir el frasco/escena sin lettering crítico y superponer la marca DREAMS con SVG/HTML nítido.

**Cierre:** contacto consistente, colección femenina reconocible sin salir de DREAMS, imagen nítida en móvil/desktop y sin regresión de performance.

### D2 — Dominio y SEO técnico

- Comprobar disponibilidad de `dreams-perfumes.up.railway.app` y renombrar el dominio Railway con su operación oficial.
- Antes del cambio, actualizar URL base, canonical, OpenGraph, sitemap, robots y redirects permitidos de Supabase Auth.
- Ejecutar smoke completo en el nuevo dominio y verificar certificado.
- Mantener transición o redirección 301 desde el dominio anterior cuando Railway lo permita; no eliminar el dominio viejo antes de verificar enlaces y auth.
- Si el subdominio gratuito no está disponible, usar una variante corta y coherente o un dominio propio.

**Cierre:** HTTPS válido, auth funcional, canonical único, smoke verde y enlaces anteriores tratados.

### S5 — QA, observabilidad y cierre

- E2E de auth, opiniones, catálogo, carrito, Admin y recuperación.
- QA responsive en 390×844, 430×932, 768×1024, 1024×768, 1440×900 y 1920×1080.
- Accesibilidad automatizada y manual, Lighthouse y presupuesto de imágenes.
- Logs/alertas de 5xx y rate limits, backup/restore documentado y checklist de rollback.

**Cierre:** CI verde, deploy SUCCESS, smoke real, QA documentado y sin bugs conocidos dentro del alcance.

## Orden recomendado de ejecución

1. S0 y S1: cerrar frontera HTTP y exposición del email Admin.
2. S2: privilegios mínimos y provisioning.
3. S3: opiniones completas sobre una base segura.
4. S4: Admin reversible y auditable.
5. D1: contacto, colección femenina e imagen de alta resolución.
6. D2: dominio sólo después de auth/SEO configurados.
7. S5: QA final y cierre.

## Estado de implementación

- 2026-08-29: S1 iniciado. Implementada verificación de `Origin`/`Referer` y `Sec-Fetch-Site` para todas las mutaciones, con allowlist exacta mediante `APP_ORIGINS`.
- 2026-08-29: separado `CONTACT_EMAIL` de `ADMIN_EMAIL`; `/api/config` dejó de exponer el identificador Admin y los footers usan el contacto solicitado.
- 2026-08-29: añadidas regresiones de origen, allowlist y configuración pública; suite local 29/29 verde.
- Pendiente dentro de S1: recuperación de contraseña, redirects de Auth y MFA/reautenticación Admin.
- 2026-08-29: añadido formulario de opiniones generales, persistencia confirmada por integración y límite de 5 altas por hora. Edición, duplicados y moderación siguen pendientes.
- S2 bloqueado temporalmente: Supabase CLI no está disponible y el entorno rechazó su descarga. No se creó una migración manual ni se aplicó SQL remoto.

## Decisión funcional pendiente

Antes de implementar S3 sólo hace falta confirmar una decisión de producto: si las opiniones serán generales sobre DREAMS o asociadas a cada perfume. La recomendación técnica y de UX es asociarlas a cada perfume, con una opinión editable por usuario y producto.

## Fuentes técnicas

- Supabase: Product Security, Row Level Security, Sessions, Password Security, Rate Limits, Security Testing y Production Checklist.
- Railway: `railway domain update old-name.up.railway.app --domain new-name` para renombrar un dominio proporcionado por Railway.
````


> Procedencia de la entrada siguiente: PR #67, commit `2ade1033d89110d220e65f564d5eb5de3aa3360c`, todavía sin integrar. Se conserva como antecedente de trabajo y pruebas de esa branch; no describe cambios funcionales incorporados por esta limpieza documental.

## Simplificacion y lectura del codigo · 11/11/2026

- Tipo: resumen identificado del mensaje actual; no es una cita literal reconstruida.
- Solicitud: reducir archivos sin romper la aplicacion; conservar README, base de datos, wireframe y declaracion de prompts; explicar el codigo en comentarios simples y nombres propios en espanol, con minusculas y sin tildes.
- Base comprobada: main `03a0ee1498040b98ddb7ca4126d24631a37b88ed`, despues de la limpieza ya integrada en PR66.
- Cambios: manual, API e indice se consolidan en README; se retiran sus copias separadas y la guia de estudio del repositorio. Los documentos anteriores siguen en el commit citado. Se conservan configuracion necesaria, SQL, tests, imagenes, diagramas y fuentes editables.
- Uso de IA: los renombres, comentarios y documentos reciben asistencia de IA. Redactar de forma natural no acredita trabajo manual ni cambia la procedencia registrada. No se modifica el historial de Git.
- Pruebas: se registraran en la PR las comprobaciones de sintaxis, limite de funciones, regresiones y builds realmente ejecutadas. No se atribuye QA remota nueva a estas pruebas locales.
- Revision humana: no acreditada; la solicitud y autorizacion del usuario no prueban una revision del codigo por los integrantes.
- Estado del registro: parcial; faltan conversaciones originales no aportadas y evidencia de revision humana. No se inventan mensajes ni fechas.

- Resultado local final: instalacion congelada y sin .git, sintaxis, inventario de 119 archivos y 2202 registros sin excesos; 495 pruebas aprobadas, 4 SQL omitidas por falta de PostgreSQL aislado; builds cloudflare, pages, admin-review y official en modo local aprobados. Comparacion estructural con parser de los 57 archivos JS/MJS/CJS de produccion: cambios limitados a nombres, comentarios y alias de exportacion, sin alterar instrucciones ni datos de negocio. No se desplego la oficial.

## Organización documental de docs/ · 11/11/2026

- Tipo: resumen identificado de la solicitud actual y su aclaración; no es una cita literal reconstruida.
- Base comprobada: main `03a0ee1498040b98ddb7ca4126d24631a37b88ed`. La PR67 sigue separada; esta tarea no incorpora sus cambios de código.
- Objetivo: dejar docs/ sólo con índice, wireframe, mapa y D.E.R.; trasladar esta declaración a la raíz y preservar el contenido académico requerido.
- Decisión comunicada por el usuario: eliminar la guía de defensa en Markdown, Word y PDF, sin trasladarla; integrar íntegramente manual y API en README antes de eliminar sus copias separadas; integrar la limpieza verificada sin publicar la web.
- Cambios: declaración trasladada a DECLARACION_PROMPTS.md; diccionario trasladado a docs/base-de-datos/README.md; índice sustituido por docs/README.md; manual y API completos integrados en README; se retiran defensa.md/.docx/.pdf, manual.md/.pdf, api.md y docs/.gitattributes. No se crean copias adicionales de los diseños.
- Pruebas y revisión: se registrarán los resultados comprobados en la PR. No se presenta esta revisión documental como QA autenticada nueva ni como una lectura nueva del esquema remoto.
- Uso de IA: análisis, organización y comprobaciones asistidos por IA; sin atribuir trabajo manual o revisión de los integrantes. Registro parcial; conversaciones ausentes no reconstruidas.

- Resultado local comprobado: enlaces relativos y contenido completo del manual/API verificados; 19 PNG válidos, 17 SVG legibles y fuentes DOT compiladas; PDFs de wireframe (17 páginas), mapa y D.E.R. abiertos y revisados. Instalación congelada sin .git ni secretos, sintaxis, inventario de 40 líneas, test de estructura, build:pages y build:official aprobados. No se modifica el código ejecutable, las migraciones ni la configuración; sólo se actualiza la expectativa de archivos raíz del test para incluir esta declaración obligatoria.
