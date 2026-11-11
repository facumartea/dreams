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
- Resultado/evidencia: Coincidencia temática con PR57, merge 6865365 del 03/11/2026. [Fuente](../evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Suite, pruebas locales y Chromium oficial según el informe, diferenciados.
- Revisión humana: no acreditada en el adjunto.

### A03. Formato de vencimiento

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> en la parte del vencimiento que sean cuatro numeros y que se ponga la barra en el medio

- Objetivo: Formatear vencimiento con cuatro dígitos y barra.
- Resultado/evidencia: Coincidencia temática con PR57; formato local y pruebas de pegado/edición acreditadas. [Fuente](../evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Casos de entrada remotos y regresiones de máscaras del agente, según informe.
- Revisión humana: no acreditada en el adjunto.

### A04. Presentación del envío

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que no dia envio gratis sacale solo la palabra "gratis" que aparezca envio $0

- Objetivo: Cambiar presentación de envío a Envío $0.
- Resultado/evidencia: Coincidencia temática con PR57; no se cambió el costo cero. [Fuente](../evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Totales y resumen hasta confirmación acreditados por el agente.
- Revisión humana: no acreditada en el adjunto.

### A05. Quitar una sección

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> quiero sacar toda esta seccion del inicio

- Objetivo: Retirar una sección de Inicio.
- Resultado/evidencia: No se identifica cuál sin la captura original. PR58/b60e33d retiró colecciones; PR62/60451ca retiró recientes. No se adjudica el extracto a ninguna por suposición. [Fuente](../evidence/home-removal-20261103/README.md).
- Pruebas del agente: Existen verificaciones por cada fase; no prueban a qué sección se refería esta cita.
- Revisión humana: no acreditada en el adjunto.

### A06. Cabeceras de colecciones

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que las tres letras de las 3 secciones sean las mismas y que el ancho de la caja del titulo de cada seccion sea mas "largo" de largo como estaba antes

- Objetivo: Uniformar letras y ancho de cajas de colecciones.
- Resultado/evidencia: Sin correspondencia de implementación exacta acreditada. PR62 quitó párrafos y ajustó composición; eso no prueba que aplicara este pedido tipográfico. [Fuente](../evidence/inicio-cabeceras-20261105/README.md).
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
- Resultado/evidencia: Guía adjunta preparada según su texto el 10/11/2026 sobre 60451ca. Esta tarea la contrasta y amplía; no hubo commit previo de ese Word en main. [Fuente](defensa.md).
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
- Resultado: El PDF2025 faltaba entonces; la matriz provisional no se convierte retrospectivamente en auditoría del PDF recibido luego. [Fuente](../auditoria-2025/INDICE.md).
- Pruebas del agente: Checks y evidencia en auditoria-2025/pruebas.json; no nueva QA por esta consolidación.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B05. Limpieza y rúbrica 2025 recibida

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR60: 3e12bc6, 05/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Leer la edición correcta, organizar y preservar registros.
- Resultado: Se retiró NEXT_CHAT_PROMPT.md obsoleto y se preservaron históricos; esta tarea no repite esa limpieza. [Fuente](informe.md).
- Pruebas del agente: 489 tests y extracción sin .git según pruebas.json histórico.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B06. Scripts coherentes, carrusel y SQL

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR61: e6d60bf, 05/11/2026.
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Resolver los pendientes técnicos y documentar la oficial.
- Resultado: Se aplicó migración nueva compatible; carrusel manual, scripts coincidentes, QA Admin real. [Fuente](../evidence/cierre-tecnico-20261105/README.md).
- Pruebas del agente: 494 tests, 4 PostgreSQL aparte, 22 checks oficiales de checkout/carrusel y QA específica, según evidencia.
- Revisión humana: no hay evidencia suficiente para atribuir a un integrante la revisión de esos cambios. Las declaraciones del usuario que la fuente registra se mantienen como declaraciones, no como revisión de código.

### B07. Inicio y cabeceras sin extras

- Fecha del prompt: **sin fecha confirmada**. Fecha de evidencia: PR62: 60451ca, 05/11/2026 (Git con zona -03:00).
- Tipo: resumen identificado; texto original completo no incorporado como cita.
- Objetivo: Retirar recientes y párrafos visibles, conservar carrusel y SEO.
- Resultado: Fuente publicada 85147d8; main integra documentación final. [Fuente](../evidence/inicio-cabeceras-20261105/README.md).
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
