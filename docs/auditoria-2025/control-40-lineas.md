# Control de 40 líneas — sin refactorización

Commit auditado: b60e33db5d9c3925808f889f6581a75dc1738ac0. Se ejecutó `node scripts/function-inventory.mjs .` y se exportó el inventario mediante la función pública del mismo script, sin cambiarlo ni sobrescribir el histórico de entrega 2026.

JavaScript/JS/MJS/CJS e inline HTML:117 archivos,2147 registros (488 declaraciones,1393 arrow,235 expresiones/métodos,31 bloques principales explícitos), máximo 40,0 excesos. Conteo físico inclusivo declaración→cierre: comentarios y blancos interiores cuentan. Dependencias y generados excluidos por el script:node_modules,.git, dist,.wrangler, coverage,.pnpm-store; no sigue symlinks; JSON-LD se trata como datos. CSS/HTML sin JS no contienen funciones; no se cuenta el archivo completo como una función.

[Detalle íntegro](inventario-funciones.json). Comando reproducible desde una carpeta extraída SIN.git: `corepack pnpm install --frozen-lockfile` y `node scripts/function-inventory.mjs .`. Esta tarea lo ejecutó sobre un flujoTAR de gitarchiveb60e33d extraído en carpeta temporal, sin generar ZIP;117/2147/0 excesos PASS. Instalación congelada PASS. El inventario usa filesystem yAcorn, no gitls-files.

## Programa principal y orquestación

Node: server/server.js, start líneas36–61 (26 líneas), más guard de arranque propio contado. Worker: fetch/fetch_official y adaptadorHTTP se cuentan como funciones; Pages:create_proxy/fetch y proxy_response idem. Navegador: callbacksDOMContentLoaded y funciones setup/start se cuentan porAST. En public/js/app.js, el arranque superior líneas297–304 contiene 8 líneas de llamadas independientes; no se confunden 300 líneas de declaraciones con un programa principal monolítico. Los31ProgramBlock son if/bucles/try/bloques superiores contados por separado. La interpretación pedagógica de «principal» debe confirmarla el profesor; no se inventa una aceptación.

## SQL/PL/pg SQL propio: hallazgo adicional

El contador del repositorio NO revisa SQL. Se contaron aparte las cuatro funciones declaradas en migraciones, desdeCREATEFUNCTION hasta cierre del cuerpo y punto y coma, con comentarios/blancos incluidos. No hay Python ni shell propios en el commit auditado. No se cambió código.

| Archivo | Función | Inicio–fin | Líneas | Resultado físico |
|---|---|---|---:|---|
| supabase/migrations/20260828144944_production_baseline.sql | private.create_profile_for_new_user |87–103|17|≤40|
| mismo archivo | private.set_updated_at |115–125|11|≤40|
| supabase/migrations/20260901090000_admin_authenticated_policies.sql | public.is_dreams_admin |3–15|13|≤40|
| supabase/migrations/20261013032746_account_carts.sql | public.dreams_cart_operation |23–75|53|EXCEDE40|

[Inventario SQL](inventario-sql.json). Bajo una lectura que incluye todas las funciones propias, existe un exceso SQL de 13 líneas. No se oculta mediante el PASSJavaScript. Falta leer el PDF 2025 y aclarar con el profesor si la regla se aplica también aPL/pg SQL; hasta entonces cumplimiento globalPARCIAL. Una eventual refactorización con pruebas correspondería a otra tarea autorizada, no a esta auditoría.

Reproducción del conteo SQL: buscar CREATE[ORREPLACE]FUNCTION en los SQL de supabase, localizar AS$$/$tag$ y su cierre seguido de punto y coma, contar saltos de línea inclusivos. Son cuatro funciones y se verificaron los rangos contra los archivos, evitando incluirGRANT/REVOKE posteriores. Ninguna se comprimió para bajar el conteo.

## Script SQL reproducible (no depende de.git)

```sh
python - <<'PYSQL'
from pathlib import Path
import re, json
rows=[]
for path in Path('supabase').rglob('*.sql'):
    source=path.read_text()
    for m in re.finditer(r'create\s+(?:or\s+replace\s+)?function\s+([\w.]+)', source, re.I):
        opening=re.search(r'\bas\s+(\$[\w]*\$)', source[m.end():], re.I)
        if not opening: continue
        tag=opening[1];body=m.end()+opening.end()
        closing=source.find(tag, body)
        end=source.find(';', closing+len(tag))+1
        start_line=source[:m.start()].count('\n')+1
        end_line=source[:end].count('\n')+1
        rows.append(dict(file=str(path), name=m[1], start=start_line, end=end_line, lines=end_line-start_line+1))
print(json.dumps(rows, indent=2))
PYSQL
```

Este parser acotado se contrastó con las cuatro definiciones existentes; no se afirma que sea un parser SQL universal. El archivo oficial checkout.js se midió aparte:23 funciones, máximo113, exceso setup_checkoutlíneas134–246. Su SHA coincide con ec04a358, no con el archivo demain; no se sumó al inventario del código entregable.
