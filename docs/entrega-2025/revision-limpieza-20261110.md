# Revisión acotada de limpieza · 10/11/2026

Base: main `60451cabe5ff9b78f97777d64120e5ff9a3238b2`. Se reutilizan [inventario anterior](inventario-archivos.json) y [limpieza PR60](limpieza.json). No se repite su eliminación de NEXT_CHAT_PROMPT.md ni se mueve nuevamente el histórico.

## Alcance y método

Se enumeraron 452 archivos versionados de la base mediante git ls-files y se compararon sus hashes SHA-256. Esto detecta duplicados exactos; no equivale a volver a auditar el contenido de los 452 archivos. Para los candidatos se buscaron referencias en código/imports, scripts, CI, configuración, documentación y publicación mediante rg, incluyendo coincidencias por nombre y ruta. No se ejecutan reparadores, seeds ni despliegues.

## Retirado

- `docs/entrega-2026/capturas/inicio-oficial.png`: copia binaria exacta de [captura preservada](../evidence/home-removal-20261103/official-home-1440.png). SHA-256 de ambas: `711d98346b5ad4090168e76cda8a5448107a08fe9887df9fe9d04cfa5db1cd53`. No hay referencia activa desde código, scripts, CI, configuración, manual ni índice. La copia conservada mantiene la evidencia visual original. No se elimina ningún recurso servido por la aplicación.
- Las únicas menciones de la ruta retirada están en los manifiestos históricos `inventario-archivos.csv`, `inventario-archivos.json` y `../auditoria-2025/archivos-versionados-commit-auditado.txt`. Esos archivos describen una instantánea anterior; se conservan sin reescribirla. Esta nota explica la diferencia con el estado actual.

## Conservado

| Grupo o candidato | Motivo |
|---|---|
| public/, server/, views/, pages/, worker/ y templates/ | Aplicación y recursos compartidos. No se modifica código ni se retiran assets utilizados. |
| package.json, lockfile, configuración y ejemplos sin secretos | Instalación, compilación y publicación reproducibles. |
| test/, scripts/, CI, auditorías de seguridad | Verificación y mantenimiento; una fecha antigua no los vuelve descartables. |
| supabase/schema.sql, migraciones y rollback | Historia de estructura y recuperación. No reescribir una migración aplicada. |
| Manual, wireframes, D.E.R., rúbricas e IA | Evidencia académica necesaria; el nombre entrega-2026 no convierte esa rúbrica en fuente de la evaluación 2025. |
| docs/history/ y evidencia única | Antecedentes ya ordenados en PR60. No se oculta el uso de IA. |
| collection-filters/local-browser.txt y official-full-browser.txt | Aunque son iguales, distinguen fases local y oficial; su procedencia documentada aporta evidencia. |
| inicio-cabeceras-20261105/inicio-escritorio-local.png e inicio-escritorio.png | Igual contenido, contexto de captura local/remota distinto; no borrar por hash solamente. |
| scripts/repair-official-secret.mjs y grant-google-admin.js | Herramientas de mantenimiento o históricas con referencias/pruebas; no se ejecutan ni se elimina una utilidad cuyo propósito sigue acreditado. |
| Bitácora previa y guía breve de entrega-2026 | Se conserva el histórico y se enlaza la guía ampliada vigente, sin duplicar manual ni gráficos. |

No se encontraron otros temporales versionados inequívocos para retirar en este alcance. No se eliminan archivos dudosos ni se limpia por nombre solamente. No se archivan nuevos documentos: el histórico de PR60 permanece en su ubicación.

## Privacidad y autoría

No se versionan audios, la transcripción privada ni el Word adjunto original, que incluía esa transcripción. La nueva guía resume temas sin identificar al participante. El registro conserva ocho extractos aportados y fuentes disponibles como historial parcial; no inventa textos, fechas, revisión humana ni participación. No se consultan secretos, datos de clientes ni hashes de contraseñas.

## Validación

[Verificación documental de esta entrega](verificacion-defensa-20261110.md). Las rutas API se contrastan estáticamente en [endpoints-verificados.json](endpoints-verificados.json); no se presentan como nuevas pruebas remotas. No hay deployment por documentación.
