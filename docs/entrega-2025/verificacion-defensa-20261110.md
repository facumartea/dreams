# Verificación documental · defensa oral 10/11/2026

## Alcance

Base de código auditada: main `60451cabe5ff9b78f97777d64120e5ff9a3238b2`, igual a la referencia de la guía adjunta. Branch documental: `docs/defensa-oral-prompts-20261110`. No se integra trabajo funcional de otras PR. Se observaron PR abiertas anteriores #32, #35–#55 (con saltos); su presencia no las incorpora a esta entrega.

No se accede a filas remotas, contraseñas, hashes, credenciales ni sesiones. No se modifica la aplicación, Auth, configuración o datos. No hay ZIP, seed, reset, migración ni deployment. No se repite QA funcional ya acreditada; la evidencia histórica conserva fecha y código.

## Comprobaciones de esta tanda

| Comprobación | Resultado |
|---|---|
| GitHub/main y estado local al inicio | main 60451ca, sin cambios locales; branch propia creada. |
| Guía adjunta y temas de los tres audios | Contrastados con código; transcripción e identificación del participante excluidas de publicación. |
| Inventario API con parser Acorn | 46 combinaciones únicas, las 46 coinciden en método, ruta, archivo y línea. Incluye route(...), options.route(...) y app.get/post(...). No es prueba remota de funcionamiento. |
| Habilitación de rutas | Contrastada con official-policy.js y configuración del Worker: 38 habilitadas por política, 2 Google preparadas y 6 bloqueadas/históricas. Los permisos siguen siendo necesarios. |
| Fichas de funciones y prácticas | 13 fichas; archivos, símbolos y nombres de tests contrastados. Los ejercicios no se declaran realizados por alumnos. |
| Seguridad conceptual | No hay dependencia cors/configuración ACAO en server/pages/worker revisados. Bcrypt se atribuye a documentación de Supabase, no a una implementación local. |
| Fuente Markdown → Word | Pandoc; formato de página A4, texto 11 pt, tablas 9,5 pt, cabecera/pie y encabezados repetidos de tabla. |
| Word → PDF | LibreOffice headless; 25 páginas con texto seleccionable. Word editable, sin transcripción privada. |
| Inspección visual | 26 páginas iniciales renderizadas e inspeccionadas mediante 3 láminas de contacto. Se retiró un salto que producía una página casi vacía; versión final de 25 páginas, última revisada a mayor tamaño. Sin recortes ni superposiciones observadas. |
| Privacidad y enlaces | Escaneo de patrones sensibles sobre documentos nuevos y texto Word/PDF; comprobación de referencias relativas y rutas. No se publican los adjuntos privados originales. |
| Eliminación | Una captura duplicada exacta sin referencias activas; su copia/evidencia original permanece. Manifiestos históricos no se reescriben. |
| Diff | Sólo documentación, continuidad, índice y retirada de una imagen documental. Sin cambios en código funcional, configuración, dependencias ni assets de la web. |

## Reproducción de verificaciones documentales

- Abrir `endpoints-verificados.json` y comparar método/ruta con la línea indicada; el cotejo de esta tanda se hizo además con AST Acorn, sin enviar peticiones a la API.
- Desde esta carpeta: `pandoc defensa.md -f gfm -t docx -o defensa-revisada.docx` genera una copia editable desde la fuente. El Word entregado añade estilos de legibilidad; no necesita generar otro para estudiar.
- Abrir defensa.docx con Word/LibreOffice y exportar a PDF; verificar enlaces, tablas y páginas antes de sustituir los entregables.
- `git diff --check` verifica espacios del diff; no acredita por sí solo contenido ni funcionamiento remoto.
- El CI obligatorio del repositorio ejecuta auditoría de dependencias, sintaxis, inventario de funciones, tests y builds sin publicar. Su resultado se registra en la PR; no se interpreta como nuevo QA remoto de Admin/Auth.

## Estado de GitHub

Pendiente de completar con la PR y resultado de CI de esta misma tanda antes de integrar. La oficial conserva su deployment anterior; push e integración documental no significan publicación web.

## Límites reales

El registro de prompts sigue siendo PARCIAL: hay extractos sin fecha/contexto y tramos originales anteriores ausentes. La bitácora histórica no equivale a originales literales. No se inventan revisión humana, autoría, fechas de clase, preentregas ni dominio individual. El simulacro empieza después de entregar los archivos y espera respuesta antes de corregir.
