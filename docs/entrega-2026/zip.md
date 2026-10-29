# Entrega en GitHub y reproducción histórica

Branch de entrega: **`codex/admin-cards-audit`**, PR https://github.com/facumartea/dreams/pull/56. Predeterminada observada: **main**, commit `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`. No se afirma que contenga la entrega mientras ésta siga en la PR. Integración autorizada sólo después de checks/revisión y dependencias resueltas; el Secret y la QA remota siguen bloqueados.

**Instrucción vigente:** el usuario confirmó **Martearena y Ruas** y pidió «no me generes un zip final subilo al github todo lo que falte y arregla lo que no va». Por tanto, se actualiza el repositorio y no se genera otro ZIP final. Si el usuario decide descargarlo después, el nombre acorde a los apellidos será `Martearena-Ruas-DREAMS.zip`. No se envió nada a Classroom.

La comprobación histórica del ZIP se hizo con `git archive` del commit exacto, prefijo `dreams/`. Así incluye sólo archivos versionados: código, rúbrica2026, wireframe PNG y SVG, manual MD/PDF con capturas locales, BD y Mermaid, bitácora, matrices, tests, scripts, package y lockfile, `.env.example`. No incluye `.git`, node_modules, `.env` real ni credenciales de ejecución. La extracción limpia del commit `633aec35ce0bb05ad24e29d3c954b6d59b3ff651` pasó instalación frozen, sintaxis92 archivosJS, inventario106/1873 sin exceder40,390 tests y cuatro builds. [Resultado versionado](verificacion-zip.json). Las credenciales reales se excluyeron del entorno de ejecución de esa comprobación. El checkpoint posterior `df70b9c01a01af7ccb6ed9565a8fde657b2678c9` también pasó extracción limpia,390tests y cuatrobuilds; CI212SUCCESS. No regenerar estos archivos por rutina ni crear un ZIP nuevo sin un pedido posterior.

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
