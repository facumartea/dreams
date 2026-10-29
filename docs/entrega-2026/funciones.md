# Límite de 40 líneas

El límite vigente es **40**, no 20. Se usa Acorn 8.15.0 fijado en desarrollo y el lockfile. Ejecutar desde la raíz, también dentro de una extracción sin `.git`:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm run check:functions
node scripts/function-inventory.mjs . --write
```

El [JSON](inventario-funciones.json) incluye archivo, nombre inferido, tipo, línea inicial/final y cantidad. Se cuentan líneas físicas inclusivas de declaración a cierre: comentarios y blancos internos incluidos. Las funciones anónimas, callbacks, métodos, getters, setters y constructores se identifican por AST, sin comprimir instrucciones para bajar el conteo. HTML inline JavaScript también se analiza; JSON-LD se excluye por ser datos.

Alcance: todos los JS/MJS/CJS y HTML propios encontrados recursivamente, incluidos servidor, navegador, Workers, Pages, scripts y tests. Se excluyen dependencias y salidas generadas: `node_modules`, `.git`, `dist`, `.wrangler`, `coverage`, `.pnpm-store`; no se siguen symlinks. No se utiliza `git ls-files`. SQL y CSS no contienen funciones JavaScript y no forman parte de este contador; sus estructuras se documentan aparte.

Programa principal: `start` en Node, `fetch` del Worker y los inicializadores de navegador se cuentan como funciones. Cada bloque ejecutable superior explícito (`if`, bucles, `try` y bloques) se cuenta también con su rango físico. Un módulo con muchas declaraciones no es un único bloque principal: imports, clases, constantes de datos y registros de callbacks se mantienen como declaraciones y sus funciones se cuentan individualmente. No se atribuye al archivo entero una función ficticia. Esta interpretación está explicitada para revisión del profesor, no como aceptación acreditada.

Refactorizaciones: construcción de Express dividida en contexto e instaladores ordenados de middleware/rutas; perfil y sesión conservan autorización; configuración Node y Workers separada del arranque; checkout separado en carga, cupón, pago y eventos; instalación de simulación académica separada de firma; wrappers de helpers convertidos en declaraciones con API pública conservada. Se ajustaron también fixtures extensos sin quitar assertions.

Pruebas del contador acreditan 41 líneas con comentarios, métodos/callbacks, main explícito, offset HTML y ejecución sin `.git`. El estado final y el total se registran en [pruebas.md](pruebas.md); no usar el inventario histórico de 19 archivos como si cubriera todo el repositorio.
