# Bitácora de uso de IA

Este registro identifica trabajo asistido por IA; no atribuye a los alumnos programación, revisión manual o dominio del código sin evidencia. Las fechas son las documentadas en commits y continuidad, no una reconstrucción de entregas de clase.

| Fecha acreditada | Prompt o resumen fiel | Resultado y evidencia | Revisión / cambios humanos acreditados |
|---|---|---|---|
| 2026-08-28 | Auditoría de arquitectura, seguridad y preparación de deploy | Entradas de `CHANGELOG.md`, separación de app y validaciones | No hay evidencia adjunta que permita atribuir cada cambio a un integrante. |
| 2026-10-27 | Continuar PR56, recuperar backend funcional y conservar oficial | Reconstrucción, pruebas locales/CI; deploy falló 401, rollback documentado | Usuario informó ajustes de Auth y carga de Secret. Resultado del Secret luego rechazado en uso; no equivale a una reparación exitosa. |
| 2026-10-28 | Diagnosticar bad_length sin exponer claves ni volver a configurar Auth | Sonda privada: espacios internos; HEAD directo/SDK401. `29ee9ea`, evidencia de credencial | Usuario autorizó reparación. No se acreditó reemplazo posterior. |
| 2026-10-28 | Continuar CI y minimizar intervención | `6f54b08` corrige qs; `2b8dcc1` prepara reparador y extracción de registro; CI209/360 PASS | No atribuir esos cambios de código a los alumnos. |
| 2026-10-29 | Priorizar conexiones existentes y una sola carga directa de Secret | `be57610`: continuidad; no dos tokens, no nueva publicación | Usuario pidió menor intervención. Carga directa todavía pendiente al inicio de esta tanda. |
| 2026-10-29 | Cerrar funcionamiento y preparar entrega según PDF2026, máximo40 líneas, wireframe, manual, BD, ZIP | Lectura del PDF original; inventario AST completo, refactorización, carrusel manual, confirmación de persistencia Admin y documentación de entrega | Trabajo de IA sujeto a pruebas; ver commit y resultados finales en `pruebas.md`. Integrantes deben revisar, corregir y defenderlo. |

## Historial que falta

La rúbrica pide bitácora **en cada preentrega** (previa el 2 de octubre). No se dispone de los prompts originales completos ni de una entrega fechada de esa preentrega. `CHANGELOG.md` y Git sirven como evidencia técnica parcial, no prueban asistencia, entrega en Classroom, participación ni revisión individual. Quedan pendientes los registros propios que posean los integrantes y la validación docente.

Para cada revisión futura registrar fecha, prompt fiel, salida aprovechada/descartada, defecto encontrado, prueba y cambio realizado, con autoría acreditada. No completar retrospectivamente como si hubiera ocurrido en clase.

## Aclaraciones recibidas el29/10/2026

El usuario respondió que el profesor aceptó Supabase, confirmó los apellidos **Martearena y Ruas** y pidió continuar las correcciones y subirlas a GitHub sin generar otro ZIP final. La IA actualiza documentación, matriz y footer con esa información. Se conserva la evidencia de extracción anterior y no se atribuye a los integrantes programación o revisión manual no acreditada.

## Reemplazo de clave informado y verificado ·29/10/2026

El usuario informó haber cambiado la clave servidor. La IA verificó la versión actualizada y ejecutó sonda privada acotada heredando ese Secret, sin leerlo: el nuevo valor todavía incluye espacios internos/controlASCII y no permite obtener respuesta HTTP válida; se retiró el Cron y se conservó la oficial restaurada. Se prepararon QA interna opt-in y guardas para no iniciar altas antes de lectura200. No se atribuye este código al alumnado ni se declara reparación o QA remota completada.
