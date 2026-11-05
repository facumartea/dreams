# Entrega DREAMS según la rúbrica 2025

**Fuente leída íntegramente:** [PDF2025](rubrica-2025.pdf), tres páginas; [texto completo](rubrica-2025.txt). [Matriz de40puntos de revisión](matriz-rubrica.md), en el orden del documento. No se usa la rúbrica 2026 como equivalente.

Commit de entrada auditado: `f0f38865de1085e85cf7a7c5ebd940510fa4eec5`, branch predeterminada `main`. Branch de trabajo: `codex/entrega-2025-claridad-limpieza`. Árbol limpio al iniciar. Había 22 PRs abiertas anteriores, sin integrar ramas ajenas: [listado actualizado](prs-pendientes.json).

La oficial sigue en Pages `a176fa63-c0c5-46aa-bb8c-c97d1eb85466`, fuente `d366551`. Backend `ef043065`, fuente `08635cd`. Se verificó el identificador por lectura de configuración; no se cambió ningún deployment. Los únicos cambios de código son comentarios, formato y el nombre local `b`→`body`: [equivalencia AST](equivalencia-ast.json), sin modificar APIs ni comportamiento.

## Resultado siguiendo el PDF

1. **Consigna/objetivo:** marca y sitio de perfumería con HTML/CSS/JavaScript, API y SQL, control de flujo y módulos. La modalidad técnica documentada corresponde a sitio con API; SQLite sólo se exige a la alternativa Flask del PDF.
2. **Diseño:** logo PNG simple dorado con transparencia y antialias, paletas coherentes por colección, jerarquías tipográficas, navegación e imágenes pertinentes. No se penaliza un logo por contar píxeles suavizados como colores conceptuales. Originales/licencias son recomendaciones adicionales, sin inventarlos ni hacerlos requisitos nuevos.
3. **Capacidades de programación:** leer/escribir código, usar documentación y resolver con autonomía dependen de defensa y observación individual; NO VERIFICABLE con sólo Git o trabajo de IA.
4. **Requerimientos:** dos integrantes confirmados (Martearena/Ruas), dentro del máximo 3; aportes requieren acreditación. Fechas literales: 30 de octubre y 12 de noviembre. No se supone su traslado a 2026. Hay más de 4 páginas, JavaScript, semántica y responsive. **Carrusel: NO CUMPLE**: fue retirado por decisión expresa; no se oculta ni se repone en esta limpieza.
5. **Documentación:** manual, 17 láminas wireframe con escritorio/móvil y mapa, D.E.R. con claves/cardinalidades y explicación de API accesibles por índice. Los diseños son retrospectivos. Se reutilizan archivos válidos sin duplicarlos ni fingir fechas anteriores.
6. **Tabla de evaluación:** modularidad JS pasa; SQL histórico y asset remoto tienen excesos descritos abajo. Funcionamiento tiene evidencia local y previa remota identificada; Admin autenticado nuevo está BLOQUEADO por falta de sesión. Codificación mejoró, pero no se garantiza que todo archivo histórico merezca el descriptor máximo. Entregas, trabajo en clase, autonomía, posesión de documentación y defensa individual son NO VERIFICABLE sin evidencia de integrantes/profesor.
7. **Formato/canal:** el PDF pide carpeta ZIP con formato `[apellido1-apellido2-apellido3-nombreproducto].zip` y entrega sólo en Classroom de INFORMÁTICA. No se genera ni envía ZIP por instrucción actual. El ejemplo de 3 apellidos no obliga a inventar un tercer integrante; aclaración docente si hace falta adaptar el nombre a 2.
8. **Aprobación:** superar 30 puntos y cumplir criterios fundamentales; nota grupal e individual pueden diferir. Si no se completa, período de diciembre. Se transcribe sin asignar nota, cambiar fechas ni garantizar aprobación.

## Limpieza y organización

Se leyó el contenido textual del árbol y se registraron referencias, propósito y grupo de cada archivo, no sólo su nombre: [inventarioJSON](inventario-archivos.json) / [CSV](inventario-archivos.csv). Los binarios se conservan como assets/documentos y no se descartan por falta de referencias textuales.

- **Eliminado:** `NEXT_CHAT_PROMPT.md`. No se importa ni ejecuta; sólo figura en el manifiesto histórico de otro commit, que se conserva. El prompt apuntaba a `drams`, Railway y 26 tests, y decía que no existía checkout. Lo vigente está en AGENTS/CURRENT_STATE y documentos funcionales. No contenía evidencia académica única; Git conserva la versión anterior.
- **Archivadas sin cambiar bytes:** tres auditorías visuales en `docs/history/visual-audits/`. Fechas, contenido y autoría se conservaron. Referencias operativas actualizadas.
- **Continuidad:** estados y planes anteriores íntegros en `docs/history/CURRENT_STATE-hasta-20261105.md` y `PLAN-hasta-20261105.md`; la raíz queda concisa y vigente. No se borraron hallazgos antiguos.
- **Conservados:** AGENTS, auditorías de seguridad, dependencias/lockfile, tests, scripts, migraciones, configuración, assets, bitácora de IA y evidencia histórica. Railway/previews/favorites/código comercial se preservan por dependencias y valor histórico, sin activarlos ni presentarlos como funciones vigentes.

[Registro de decisiones y comprobación de identidad](limpieza.json). El inventario histórico que menciona rutas antiguas sigue intacto porque describe el commit anterior, no enlaces de navegación actuales.

## Legibilidad y 40 líneas

Comentarios en español explican propósito del carrito por UUID, contexto firmado, hidratación con precios actuales, deduplicación de opiniones, permisos de dueño, guard de origen y aislamiento del checkout. Se reemplazó sólo un nombre local ambiguo y se dividió una condición de validación larga; no hubo renombrado masivo ni código nuevo ornamental.

[Inventario actual](inventario-funciones.json):117 archivos y 2147 registros, máximo 40, sin excesos JavaScript. El contador usa Acorn y filesystem; incluye métodos/callbacks y bloques superiores, comentarios y blancos interiores. Excluye dependencias/generados y no requiere .git. Principal: arranque de Node, fetch de Worker/Pages y callbacks de inicialización, no todo el archivo con sus declaraciones. Se reutiliza [explicación detallada](../auditoria-2025/control-40-lineas.md) con sus alcances.

**Pendientes que no se ocultan:**

- `supabase/migrations/20261013032746_account_carts.sql`, `dreams_cart_operation`,53 líneas:  es una migración ya aplicada. No se reescribe el historial de esquema ni se reduce a base de comprimir. Refactorizar la función vigente exige una nueva migración aditiva y equivalencia en PostgreSQL aislado; no se aplicó una modificación de BD para maquillar este requisito. El cumplimiento global queda PARCIAL si incluyeSQL.
- La oficial sirve `checkout.js` legado de `ec04a358`, con `setup_checkout`113 líneas, distinto del código descargable. Sigue informado; esta limpieza semánticamente equivalente no publica assets ni habilita un deploy sin su QA.

## Pruebas y alcance real

Checks en 103 archivos y 489 tests locales PASS después de los comentarios/renombre; fixtures prueban aislamiento del carrito, opiniones propias, productos/imágenes y Admin. No son una nueva escritura real en producción. Builds e inventario sin .git se registran en [pruebas](pruebas.json). La extracción del árbol versionado sin .git pasó instalación congelada, inventario, sintaxis y build de Pages, sin secretos reales ni generar ZIP.

La interfaz no cambió: se reutilizan las lecturas 390/1440 y las pruebas funcionales anteriores del mismo backend, distinguiendo fechas y código en los informes originales. No se repitieron registros/cobros/guardados reales sin motivo. Admin autenticado nuevo queda BLOQUEADO; no se solicitan ni cambian contraseñas. No se enviaron mensajesWhatsApp ni se alteraron stock/pedidos/cupones.

Wireframes/DER conservan el mismo contenido y archivos verificados: se revisaron representativosPDF/PNG y su contraste con fuente/versión de la oficial. RLS/PK/FK se documentan según metadatos previos de sólo lectura, sin consultar filas personales ni hashes. No se afirman nuevas políticas o migraciones remotas.

## Prioridades y evidencia faltante

1. **P 1:** carrusel ausente. Resolver con el profesor o encargar expresamente otro carrusel; la eliminación anterior sigue respetada.
2. **P 1:** decidir alcance de 40 sobre SQL e implementar una migración nueva probada si debe aplicarse. No declarar cumplimiento absoluto por elPASS de JavaScript.
3. **P 1:** alinear en tarea funcional específica el asset checkout.js de la oficial y repetir lo afectado con rollback; esta limpieza no lo publica por rutina.
4. **P 1:** comprobantes de preentrega/entrega, aportes, asistencia, autonomía y defensa. Sólo integrantes/profesor pueden acreditarlos.
5. **P 2:** originales/procedencia y licencias cuando estén disponibles; organizar entrega con este índice, sin borrar registros de IA.

No se garantiza nota. Avance: se resuelve la falta del PDF y se completa la matriz en su orden; quedan límites funcionales/académicos expresos. No hubo pérdida de información única ni cambios de credenciales. **Sin ZIP y sin deploy por esta tanda.**

## Función de cada grupo de archivos

| Grupo | Contenido y utilidad | Decisión |
|---|---|---|
| A | Código frontend/backend/adaptadores y assets: implementación del sitio y contratos. | Conservar. Helpers sin uso público pueden tener consumidores de tests; no borrarlos por nombre. |
| B | package/lockfile, ejemplos, configuración y migraciones: reproducir ejecución, build y esquema. | Conservar; distinguir configuración vigente y variantes históricas. |
| C | Tests, scripts, CI y seguridad: verificar regresiones y mantener controles. | Conservar auditorías aunque antiguas; los runners QA retirados de producción aún sirven a tests. |
| D | Manual, gráficos, API, defensa, matrices: explicar y presentar el proyecto. | Reutilizar fuentes válidas y enlazar la evaluación 2025 sin duplicar gráficos ni mezclar rúbricas. |
| E | README, AGENTS y continuidad: entrada y operación actual. | Actualizar hechos, resumir raíz y archivar el original completo. |
| F | Evidencia y planes de otras etapas: conservar decisiones y procedencia. | Archivar sólo cuando está claro el propósito; no borrar por antigüedad. |
| G | Prompt obsoleto y descartables comprobados. | Sólo NEXT_CHAT_PROMPT.md eliminado, tras referencias e inspección; no se amplía la limpieza por suposición. |

El inventario es una clasificación explicada, no una autorización de borrado por extensión o ruta. Para el único eliminado y los archivos movidos se verificaron contenido, dependencias y duplicación de información vigente. Los demás archivos se preservan ante duda. La revisión de nombres no sustituye la de sus consumidores.
