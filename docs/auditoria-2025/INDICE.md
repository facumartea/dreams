> **Histórico del03/11/2026:** entonces faltaba elPDF. El05/11se recibió y leyó; la evaluación vigente está en [entrega2025](../entrega-2025/INDICE.md). Se conserva este informe original para no alterar su contexto. Los gráficos se reutilizan; Inicio y mapa se actualizan el 05/11 por PR #61 para documentar el nuevo carrusel manual, manteniendo su carácter retrospectivo. PR62 actualiza Inicio/catálogo por retiro de recientes, indicador sólo accesible y cabeceras sin párrafo.

# Auditoría2025 y gráficos — índice

**BLOQUEADO: ** falta el PDF 2025 solicitado. No se usó el PDF 2026 como equivalente. Informe y matriz son provisionales hasta leerlo. Los gráficos son documentación retrospectiva del diseño implementado, generados03/11/2026, no documentos de preentrega.

- [Informe técnico y pendientes](informe.md).
- [Matriz preliminar según listado del pedido, NO según un PDF leído](matriz-preliminar.md).
- [Alcance, commit y PRs abiertas](alcance.json) · [archivos versionados en b60e33d](archivos-versionados-commit-auditado.txt).
- [Wireframes PDF vectorial, 17 láminas](graficos/wireframes.pdf).
- [Mapa PDF](graficos/mapa-navegacion.pdf) · [PNG](graficos/mapa-navegacion.png) · [DOT editable](fuentes/mapa-navegacion.dot) · [SVG editable](fuentes/mapa-navegacion.svg).
- [DER PDF vectorial](graficos/der.pdf) · [PNG](graficos/der.png) · [DOT editable](fuentes/der.dot) · [SVG editable](fuentes/der.svg).
- [Diccionario BD, cardinalidades y discrepancias](base-de-datos.md) · [metadatos remotos](metadatos-bd-remota.json) · [índices](indices-bd-remota.json).
- [Control 40 líneas y alcances JS/SQL/principal](control-40-lineas.md) · [inventario JS](inventario-funciones.json) · [SQL](inventario-sql.json) · [assetoficialdistinto](checkout-oficial-inventario.json).
- [Pruebas/comandos](pruebas.json) · [contrasteoficiallectura](contraste-oficial.json).

## Láminas por pantalla

Cada lámina compara escritorio1440 y móvil390 en escala esquemática; estados con datos se dibujan desde fuentes/fixtures, no mediante escritura remota. Adminsin sesión nueva: basado enviews/admin.html/controladores y evidencia previa identificada, no una autorización eludida.

| Lámina | Pantalla | PNG | Fuente SVG |
|---|---|---|---|
|1|Inicio|[PNG](graficos/wireframe-01.png)|[SVG](fuentes/01-inicio.svg)|
|2|Catálogo|[PNG](graficos/wireframe-02.png)|[SVG](fuentes/02-catalogo.svg)|
|3|Diálogo de filtros|[PNG](graficos/wireframe-03.png)|[SVG](fuentes/03-filtros.svg)|
|4|Detalle|[PNG](graficos/wireframe-04.png)|[SVG](fuentes/04-detalle.svg)|
|5|Login|[PNG](graficos/wireframe-05.png)|[SVG](fuentes/05-login.svg)|
|6|Registro|[PNG](graficos/wireframe-06.png)|[SVG](fuentes/06-registro.svg)|
|7|Carrito|[PNG](graficos/wireframe-07.png)|[SVG](fuentes/07-carrito.svg)|
|8|Checkout|[PNG](graficos/wireframe-08.png)|[SVG](fuentes/08-checkout.svg)|
|9|Confirmación|[PNG](graficos/wireframe-09.png)|[SVG](fuentes/09-confirmacion.svg)|
|10|Nosotros / contacto|[PNG](graficos/wireframe-10.png)|[SVG](fuentes/10-nosotros.svg)|
|11|Admin · Productos|[PNG](graficos/wireframe-11.png)|[SVG](fuentes/11-admin-productos.svg)|
|12|Admin · Disponibilidad baja|[PNG](graficos/wireframe-12.png)|[SVG](fuentes/12-admin-disponibilidad-baja.svg)|
|13|Admin · Cupones|[PNG](graficos/wireframe-13.png)|[SVG](fuentes/13-admin-cupones.svg)|
|14|Admin · Pedidos|[PNG](graficos/wireframe-14.png)|[SVG](fuentes/14-admin-pedidos.svg)|
|15|Admin · Usuarios|[PNG](graficos/wireframe-15.png)|[SVG](fuentes/15-admin-usuarios.svg)|
|16|Admin · Consultas|[PNG](graficos/wireframe-16.png)|[SVG](fuentes/16-admin-consultas.svg)|
|17|Admin · Opiniones|[PNG](graficos/wireframe-17.png)|[SVG](fuentes/17-admin-opiniones.svg)|

## Edición, portabilidad y revisión

PDF vectorial con texto y PNG suficientes para lectura offline; no dependen de rutasworkspace ni servicios temporales. SVG se edita conInkscape u otro editor SVG, DOTcon Graphviz y el modelo de pantallas está enfuentes/pantallas.json. Los PDF pueden ampliarse sin perder nitidez; los PNG por lámina evitan reducir todo a una única imagen. Para regenerarDOT: `dot -Tpdf fuentes/der.dot -o graficos/der.pdf` y `dot -Tpng -Gdpi=150 fuentes/der.dot -o graficos/der.png`. No hace falta instalar herramientas para leerlos.

Se abrieron los PDF rasterizados y se revisaron visualmente las17 láminas (montaje y detalle), elDER y elmapa; se corrigieron textos móviles que excedían marcos y se contrastó la distribución deCheckout/Nosotros/Admin con el HTML real. No se publicó ningún cambio web ni se creó ZIP. Los documentos históricos siguen intactos.
