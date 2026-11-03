# Auditoría de entrega: informe provisional para la rúbrica 2025

**ESTADO: BLOQUEADO para cerrar la auditoría del PDF 2025.** El archivo solicitado no está entre los adjuntos disponibles ni en el repositorio auditado; sólo se encontró la rúbrica 2026 anterior. Se pidió el PDF 2025 al usuario al iniciar. No se utilizó otra edición como equivalente ni se inventaron sus fechas, orden o condiciones de aprobación.

La auditoría técnica independiente y los gráficos sí están preparados. La [matriz provisional](matriz-preliminar.md) sigue el listado del pedido, **no el orden de un PDF que no se pudo leer**. Sus estados no constituyen una certificación definitiva de la rúbrica.

## 1. Alcance de la descarga

- Repositorio: `facumartea/dreams`.
- Branch predeterminada verificada por la API de GitHub: `main`.
- Commit auditado: `b60e33db5d9c3925808f889f6581a75dc1738ac0`.
- Árbol local limpio antes de crear la branch documental `docs/auditoria-rubrica-2025`.
- El commit contiene 325 archivos versionados: [manifiesto completo](archivos-versionados-commit-auditado.txt).
- No se incluyeron archivos temporales, carpetas de trabajo externas ni contenido de PRs por el mero hecho de existir. No se generó ningún ZIP.

Había 22 PRs abiertas antes de esta auditoría. Nueve HEAD ya son ancestros del commit auditado; las otras 13 no lo son. Una PR abierta no equivale siempre a código excluido: algunas tienen otra base o sus cambios se incorporaron antes. Ser ancestro tampoco garantiza que todos sus archivos sigan idénticos. [Listado con ramas, SHA y comprobación](alcance.json). La descarga de GitHub incluye el árbol de la rama seleccionada, no todos los archivos locales ni todas las PRs.

## 2. Contraste con la oficial

La oficial es https://dreams-perfumes.pages.dev/. Su frontend publicado `d366551` está incluido en el commit auditado; el backend sigue en `ef043065`, fuente `08635cd`.

En esta ejecución se observaron Inicio, catálogo, detalle, Nosotros, Cuenta, carrito y checkout en Chromium de 390 y 1440 px: respuestas 200, sin desbordamiento horizontal ni errores JavaScript observados. El diálogo de filtros abrió correctamente. Se bloquearon las peticiones del navegador distintas de GET/HEAD antes de llegar a red. No se enviaron formularios, mensajes ni pagos.

GET `/admin` devolvió 403. La inspección remota autenticada de sus módulos queda **BLOQUEADA por falta de una sesión autorizada disponible**. Las láminas Admin se basan en `views/admin.html`, sus controladores y evidencia previa identificada; no presentan una sesión nueva ni eluden autorización.

Cinco assets comparados coinciden con `main`: `app.js`, `carrito.js`, `presentation.js`, `academic-inputs.js` y `style.css`. **`checkout.js` no coincide**: la oficial sirve el archivo legado de `ec04a358`; su SHA coincide con ese commit y contiene `setup_checkout` de 113 líneas, entre 134 y 246. Este archivo remoto no se suma al inventario del código descargable. [Hashes y observaciones](contraste-oficial.json) · [conteo remoto](checkout-oficial-inventario.json).

La evidencia de registro/login/sesión/logout/checkout de PR #57 se conserva como prueba previa sobre el mismo backend `ef043065`, diferenciada de las lecturas actuales. No se convierte evidencia Admin de otra versión en una prueba remota nueva. No se corrigió el proxy ni se desplegó nada durante esta auditoría.

## 3. Diseño

DREAMS tiene marca de fantasía, símbolo PNG, fotografías de producto, iconos, tokens de color y jerarquías tipográficas. Las variantes de Mujer, Hombre y Unisex usan una misma estructura con paletas específicas; coherencia no significa que todas las páginas tengan los mismos colores de píxel.

El PNG limpio de 56 × 79 fue inspeccionado visualmente. Se observa intención de diseño dorada con transparencia y suavizado. **No se declara incumplimiento contando tonos de antialias como tintas adicionales.** Falta un original vectorial o apropiado y evidencia de autoría/procedencia para una valoración completa. Las licencias individuales de imágenes tampoco están acreditadas. No se inventan derechos de uso.

Navegación, enlaces, etiquetas y jerarquías están presentes. La revisión no equivale a una auditoría completa WCAG ni a una calificación estética docente. Véanse D01–D06 de la matriz.

## 4. Programación y funcionamiento

La arquitectura es compatible con la opción de sitio HTML/CSS/JS que consume una API: hay más de cuatro páginas distintas y JavaScript propio. Los filtros Mujer/Hombre/Unisex no se cuentan como tres HTML adicionales. Falta contrastar la modalidad elegida con el PDF 2025 y la evidencia de elección del grupo.

El recorrido real es navegador → API propia → backend → Supabase Auth/Data API. La documentación explica ese uso y enlaza al proveedor. WhatsApp se identifica como enlace externo, no como API de mensajería. **No se exige SQLite a la opción de sitio web ni se traslada esa exigencia de la rúbrica 2026.**

**Carrusel: NO CUMPLE frente al requisito mencionado en el pedido.** El único carrusel fue retirado por solicitud expresa en PR #58. No queda otro, ni se mantiene oculto ni se agrega un reemplazo en esta auditoría.

HTML semántico y responsive están presentes; las rutas observadas pasaron en 390/1440 px. Hay módulos y comentarios útiles, junto con estilo compacto y archivos históricos heterogéneos. La valoración de legibilidad es parcial; no se refactorizó ni se comprimió código.

El [control de 40 líneas](control-40-lineas.md) distingue tres alcances:

1. **Repositorio JavaScript:** 117 archivos, 2.147 registros de funciones/callbacks/métodos/bloques, máximo 40 y cero excesos.
2. **SQL/PLpgSQL propio:** cuatro funciones; `public.dreams_cart_operation` tiene 53 líneas, de 23 a 75, en la migración del carrito.
3. **Asset remoto distinto:** `setup_checkout` tiene 113 líneas en el `checkout.js` servido por la oficial.

No se ocultan los dos últimos hallazgos con el PASS JavaScript. La aplicación pedagógica del límite a SQL y al programa principal requiere el literal del PDF y criterio del profesor.

## 5. Documentación

En el commit auditado había manual Markdown/PDF, mapa de navegación SVG/PNG, descripción de BD con Mermaid y explicación de API. Su presencia no demuestra por sí sola que sean completos o fieles.

El wireframe anterior era principalmente un mapa general. Esta tarea agrega **17 láminas por pantalla, con escritorio y móvil**, mapa de navegación y fuentes editables. Se rotulan «Documentación retrospectiva del diseño implementado»: no son una preentrega anterior ni un trabajo manual atribuido a los integrantes.

El nuevo D.E.R. se contrastó con columnas, restricciones e índices remotos de las nueve tablas públicas. Incluye PK, FK, claves compuestas y nulabilidad; separa `auth.users`, tablas activas y las históricas. Los snapshots JSON no se dibujan como FK a productos. Se corrige documentalmente la cardinalidad Auth → perfil, sin borrar el diagrama histórico. El alcance no es el esquema interno completo de Supabase. [Diccionario y diferencias](base-de-datos.md).

La documentación nueva sólo entra en la descarga de `main` después de integrar su PR; no se afirma que ya existiera en `b60e33d`.

## 6. Aspectos académicos

El usuario confirmó los apellidos Martearena y Ruas; el footer y README los reflejan. No hay acta oficial del grupo ni evidencia suficiente de permanencia, asistencia, participación o autonomía.

Fechas, entregas previas/final, formato y nombre del archivo, y condiciones de aprobación quedan **NO VERIFICABLE** hasta disponer del PDF 2025 y los comprobantes necesarios. No se toman las fechas de 2026 ni se supone que el calendario 2025 aplique a otra edición.

La guía de defensa ayuda a practicar, pero no prueba dominio individual. Git y la bitácora de IA no demuestran trabajo en clase. No se atribuyen a los alumnos cambios realizados por IA, no se garantiza una nota y no se envía nada a Classroom.

## 7. Qué falta y qué conviene revisar

**A. Incumplimiento confirmado frente al listado del pedido:** carrusel ausente. Hallazgos técnicos confirmados: función SQL de 53 líneas y función del asset remoto de 113 líneas. Su valoración exacta bajo la rúbrica queda pendiente de su fuente original.

**B. Cumplimientos parciales:** originales/licencias del logo y las imágenes; alineación de runtime y repositorio; revisión Admin autenticada; interpretación del límite sobre SQL; reproducción del Worker fijado a `marca` frente al baseline que crea `brand`.

**C. Evidencia faltante:** PDF 2025, comprobantes de entregas, nómina y aportes individuales, participación y defensa. Una nueva revisión Admin, si se requiere, debe hacerse con una sesión supervisada, sin pedir secretos por chat.

**D. Documentación contradictoria u obsoleta:** la carpeta `entrega-2026` no sustituye esta consigna; bloques históricos de CURRENT_STATE/PLAN/CHANGELOG y PRs abiertas describen Auth bloqueada, carrusel y hosting de versiones anteriores. El contador documentado en `funciones.md` revisa JavaScript, no SQL. El D.E.R. anterior hacía obligatorio el perfil para todo usuario Auth. `schema.sql` es histórico y usa `brand`; el remoto usa `marca`. Todo se conserva y se señala.

**E. Elementos útiles adicionales:** tests, CI, seguridad, RLS, rollback, guía de defensa y bitácora transparente. No se convierten en prueba de asistencia ni en requisitos inventados.

**F. Elementos para revisar al preparar la entrega, sin eliminarlos aquí:** capturas históricas redundantes, matrices de distintas ediciones, configuraciones de preview/Railway y módulos preparados o retirados de Mercado Pago/demo/favorites. «No exigido» no significa «hay que borrarlo». No hay `node_modules` ni `.env` real versionados; el escaneo acotado de patrones PEM no encontró claves privadas. Esto no certifica toda la historia Git libre de secretos.

## 8. Pendientes priorizados

1. **P0:** adjuntar y leer completo el PDF 2025; ordenar la matriz según sus criterios y transcribir sus fechas y condiciones literalmente.
2. **P1:** resolver con el profesor el carrusel ausente y el alcance del límite de 40 sobre SQL. Cualquier cambio funcional correspondería a otra tarea autorizada.
3. **P1:** alinear en otra tarea el `checkout.js` publicado con el código revisado, con pruebas y rollback. No se modificó aquí.
4. **P1:** aportar comprobantes y realizar defensa individual; decidir si hace falta una inspección Admin supervisada.
5. **P2:** aportar originales/licencias y usar un índice que distinga vigente, histórico y ediciones, sin borrar evidencia.

## 9. Pruebas ejecutadas

- `corepack pnpm check`: 103 archivos, PASS.
- `corepack pnpm test`: 489 PASS, cero fallos/omitidos, fixtures aislados.
- `corepack pnpm build:pages` y `corepack pnpm build:official`: PASS; sólo build/dry-run, sin publicación.
- Instalación frozen e inventario desde extracción TAR sin `.git`: PASS, 117/2147/cero excesos. No se generó ZIP.
- Navegador oficial: GET/HEAD; peticiones de otro tipo abortadas antes de red. Esquema remoto: sólo metadatos.

[Resultados estructurados](pruebas.json). No se prometió arranque conectado sin configuración de desarrollo. No se realizaron cambios de aplicación, datos, Auth, credenciales, esquema, configuración ni despliegues.

## 10. Límite del cierre

La parte gráfica y técnica independiente está completa. **La auditoría definitiva, en el orden del PDF 2025, permanece BLOQUEADA por falta del archivo.** La matriz actual es provisional y sigue el pedido, sin fingir haber leído la fuente.

El commit de documentación y la integración se registran en la PR de GitHub. No alteran el commit auditado `b60e33d`. Los aspectos académicos sólo pueden acreditarlos los integrantes y el profesor.
