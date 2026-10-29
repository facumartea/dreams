# ZIP, branch y reproducción

Branch de entrega: **`codex/admin-cards-audit`**, PR https://github.com/facumartea/dreams/pull/56. Predeterminada observada: **main**, commit `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`. No se afirma que contenga la entrega mientras ésta siga en la PR. Integración autorizada sólo después de checks/revisión y dependencias resueltas; el Secret y la QA remota siguen bloqueados.

Nombre provisional: `dreams-PR56-<commit>.zip`. Los apellidos exactos están preguntados y pendientes; no se usaron las variantes contradictorias del footer. No se envió nada a Classroom.

El ZIP se crea con `git archive` del commit exacto, prefijo `dreams/`. Así incluye sólo archivos versionados: código, rúbrica2026, wireframe PNG y SVG, manual MD/PDF con capturas locales, BD y Mermaid, bitácora, matrices, tests, scripts, package y lockfile, `.env.example`. No incluye `.git`, node_modules, `.env` real ni credenciales de ejecución. El resultado de extracción se añadirá al checkpoint final; no declarar versión final sin comprobarlo.

Después de extraer en carpeta nueva, sin `.git` ni secretos:

```sh
cd dreams
corepack pnpm install --frozen-lockfile
corepack pnpm run check
corepack pnpm run check:functions
corepack pnpm test
corepack pnpm run build:pages
corepack pnpm run build:official
```

Los builds son locales/dry-run, no despliegues. También se validan los otros dos builds de CI. No se necesita clave productiva ni se promete arranque conectado sin un proyecto de desarrollo configurado. El manual explica uso, mientras README separa reproducción offline de conexión real.

Para descargar desde GitHub con un SHA exacto, usar `https://github.com/facumartea/dreams/archive/<SHA>.zip` sustituyendo SHA por el checkpoint verificado. El botón Code/Download ZIP de la portada utiliza la branch seleccionada/predeterminada; no equivale automáticamente al contenido de una PR. El nombre definitivo debe respetar los apellidos confirmados y producto.
