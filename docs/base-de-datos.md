# D.E.R. — alcance y diccionario de datos

Consulta de metadatos de sólo lectura del03/11/2026, proyecto Supabase esperado. Incluye las nueve tablas de `public` y únicamente `auth.users.id` como frontera del servicio Auth. **No es el esquema interno completo de Supabase ni un dump de producción.** No se consultaron filas, correos, contraseñas, hashes ni sesiones. RLS figura habilitado en las nueve tablas; no se revalidaron todas sus políticas/grants en esta tarea.

[Diagrama PDF](base-de-datos/der.pdf) · [PNG](base-de-datos/der.png) · [DOT editable](base-de-datos/der.dot) · [Esquema e índices estructurales](base-de-datos/esquema.json).

## Lectura de las relaciones

Cada línea es una FK real, rotulada con columna hija → columna padre. La multiplicidad junto al padre indica cuántos padres puede tener cada hijo (1 o0..1); junto al hijo, cuántos hijos puede tener cada padre (0..1 o0..N). No se exige que todo usuario Auth tenga perfil: `profiles.id` es PK/FK y admite cero o un perfil por usuario. Los dos campos marcadosPK en favorites y account_cart_operations forman UNA clave primaria compuesta.

Los artículos en `account_carts.items` y `orders.items` son snapshots JSONB: su asociación con productos es lógica, **no FK**. No se dibujó una FK inexistente. Las referencias/tickets académicos son firmados, no tablas de pedidos nuevos. `favorites` existe remotamente pero su funcionalidad fue retirada. `orders` se consulta desde Admin y para límites de cupones; el checkout académico no inserta pedidos comerciales.

Tipos Postgre SQL: int8 = bigint; int4 = integer; bool = boolean; timestamptz = timestamp con zona; uuid/text/numeric/jsonb conservan su tipo. El archivo base-de-datos/esquema.json conserva nulabilidad, defaults, constraints e índices estructurales, sin datos personales.

## Diferencias con el repositorio

- `app/supabase/schema.sql` es baseline histórico: usa `products.brand`, mientras la base real usa `marca`; el API expone brand y el adaptador Node detecta ambos. El Worker oficial está fijado a marca.
- El baseline histórico no contiene todas las tablas/columnas posteriores: orders/coupons/carritos/operation_id se incorporan por migraciones. No se presenta el schema histórico como dump completo.
- Reproducir migraciones en un proyecto nuevo genera brand; debe revisarse la adaptación del Worker antes de conectarlo. No se ejecutó esa migración ni se cambió configuración.
- La relación Auth→perfil de la documentación anterior era obligatoria en ambos sentidos; la FK sólo garantiza un Auth por perfil y0..1 perfiles por Auth. Este diagrama corrige la representación documental, conservando el histórico original.

## Tablas y campos verificados

### public.account_cart_operations

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| user_id | uuid / uuid | NO | PK, FK |
| operation_id | uuid / uuid | NO | PK |
| operation | jsonb / jsonb | NO |  |
| created_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `PRIMARY KEY (user_id, operation_id)`
- `FOREIGN KEY (user_id) REFERENCES account_carts(user_id) ON DELETE CASCADE`

### public.account_carts

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| user_id | uuid / uuid | NO | PK, FK |
| items | jsonb / jsonb | NO |  |
| revision | bigint / int8 | NO |  |
| updated_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `CHECK (((jsonb_typeof(items) = 'array'::text) AND (jsonb_array_length(items) <= 30)))`
- `PRIMARY KEY (user_id)`
- `CHECK ((revision >= 0))`
- `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE`

### public.coupons

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint / int8 | NO | PK |
| code | text / text | NO | UK |
| discount_percent | numeric / numeric | NO |  |
| active | boolean / bool | NO |  |
| expires_at | timestamp with time zone / timestamptz | YES |  |
| max_uses | integer / int4 | YES |  |
| per_user_limit | integer / int4 | YES |  |
| minimum_purchase | numeric / numeric | YES |  |
| conditions | jsonb / jsonb | NO |  |
| created_at | timestamp with time zone / timestamptz | NO |  |
| updated_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `CHECK (((code = upper(code)) AND (code ~ '^[A-Z0-9_-]{3,40}$'::text)))`
- `UNIQUE (code)`
- `CHECK ((jsonb_typeof(conditions) = 'object'::text))`
- `CHECK (((discount_percent > (0)::numeric) AND (discount_percent <= (100)::numeric)))`
- `CHECK (((max_uses IS NULL) OR (max_uses > 0)))`
- `CHECK (((minimum_purchase IS NULL) OR (minimum_purchase >= (0)::numeric)))`
- `CHECK (((per_user_limit IS NULL) OR (per_user_limit > 0)))`
- `PRIMARY KEY (id)`

### public.favorites

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| user_id | uuid / uuid | NO | PK, FK |
| product_id | bigint / int8 | NO | PK, FK |
| created_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `PRIMARY KEY (user_id, product_id)`
- `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE`

### public.inquiries

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint / int8 | NO | PK |
| user_id | uuid / uuid | YES | FK |
| product_id | bigint / int8 | YES | FK |
| product_name | text / text | NO |  |
| user_name | text / text | YES |  |
| user_email | text / text | YES |  |
| created_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `PRIMARY KEY (id)`
- `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`
- `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL`

### public.orders

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid / uuid | NO | PK |
| user_id | uuid / uuid | NO | FK |
| provider | text / text | NO |  |
| provider_preference_id | text / text | YES |  |
| provider_payment_id | text / text | YES |  |
| status | text / text | NO |  |
| status_detail | text / text | YES |  |
| currency | text / text | NO |  |
| subtotal | numeric / numeric | NO |  |
| discount | numeric / numeric | NO |  |
| total | numeric / numeric | NO |  |
| coupon_id | bigint / int8 | YES | FK |
| coupon_code | text / text | YES |  |
| coupon_percent | numeric / numeric | YES |  |
| items | jsonb / jsonb | NO |  |
| paid_at | timestamp with time zone / timestamptz | YES |  |
| created_at | timestamp with time zone / timestamptz | NO |  |
| updated_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `CHECK (((discount >= (0)::numeric) AND (discount <= subtotal)))`
- `CHECK (((total >= (0)::numeric) AND (total = (subtotal - discount))))`
- `FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL`
- `CHECK ((((coupon_code IS NULL) AND (coupon_percent IS NULL) AND (discount = (0)::numeric)) OR ((coupon_code = upper(coupon_code)) AND (coupon_percent > (0)::numeric) AND (coupon_percent <= (100)::numeric) AND (discount > (0)::numeric))))`
- `CHECK ((currency ~ '^[A-Z]{3}$'::text))`
- `CHECK (((jsonb_typeof(items) = 'array'::text) AND (jsonb_array_length(items) > 0)))`
- `PRIMARY KEY (id)`
- `CHECK ((provider = ANY (ARRAY['mercado_pago'::text, 'demo'::text])))`
- `CHECK ((status = ANY (ARRAY['created'::text, 'approved'::text, 'rejected'::text, 'pending'::text, 'cancelled'::text, 'error'::text])))`
- `CHECK (((status_detail IS NULL) OR (char_length(status_detail) <= 160)))`
- `CHECK ((subtotal >= (0)::numeric))`
- `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT`

### public.products

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint / int8 | NO | PK |
| marca | text / text | NO | UK |
| name | text / text | NO | UK |
| gender | text / text | NO |  |
| category | text / text | NO |  |
| size_ml | integer / int4 | NO |  |
| price | numeric / numeric | NO |  |
| stock | integer / int4 | NO |  |
| intensity | integer / int4 | NO |  |
| family | text / text | NO |  |
| top_notes | text / text | NO |  |
| heart_notes | text / text | NO |  |
| base_notes | text / text | NO |  |
| description | text / text | NO |  |
| image_url | text / text | NO |  |
| featured | boolean / bool | NO |  |
| created_at | timestamp with time zone / timestamptz | NO |  |
| updated_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `UNIQUE (marca, name)`
- `CHECK ((category = ANY (ARRAY['diseñador'::text, 'nicho'::text])))`
- `CHECK ((gender = ANY (ARRAY['hombre'::text, 'mujer'::text, 'unisex'::text])))`
- `CHECK (((intensity >= 1) AND (intensity <= 5)))`
- `PRIMARY KEY (id)`
- `CHECK ((price >= (0)::numeric))`
- `CHECK ((size_ml > 0))`
- `CHECK ((stock >= 0))`

### public.profiles

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | uuid / uuid | NO | FK, PK |
| name | text / text | NO |  |
| role | text / text | NO |  |
| created_at | timestamp with time zone / timestamptz | NO |  |

Restricciones declaradas:
- `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE`
- `CHECK (((char_length(name) >= 1) AND (char_length(name) <= 80)))`
- `PRIMARY KEY (id)`
- `CHECK ((role = ANY (ARRAY['customer'::text, 'admin'::text])))`

### public.reviews

| Campo | Tipo | Nulo | Clave |
|---|---|---|---|
| id | bigint / int8 | NO | PK |
| user_id | uuid / uuid | YES | FK |
| user_name | text / text | NO |  |
| rating | integer / int4 | NO |  |
| comment | text / text | NO |  |
| created_at | timestamp with time zone / timestamptz | NO |  |
| operation_id | uuid / uuid | YES |  |

Restricciones declaradas:
- `CHECK (((char_length(comment) >= 1) AND (char_length(comment) <= 1000)))`
- `PRIMARY KEY (id)`
- `CHECK (((rating >= 1) AND (rating <= 5)))`
- `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL`

## Unicidades adicionales

Ver índices remotos: reviews_owner_operation_unique es único parcial sobre(user_id, operation_id) cuandooperation_id no esNULL; los identificadores de proveedor enorders también tienen índices únicos parciales. No son claves foráneas adicionales.

Para regenerar el gráfico con Graphviz, sin conexión: `dot -Tpdf base-de-datos/der.dot -o base-de-datos/der.pdf` y `dot -Tpng -Gdpi=150 base-de-datos/der.dot -o base-de-datos/der.png`. El PDF/PNG se abren sin instalar Graphviz. Los campos completos se conservan aquí y en metadatos; el diagrama prioriza los campos relevantes para evitar una lámina ilegible.

## Actualización técnica del 05/11/2026 — PR #61

La migración `20261105160613_modularize_account_cart.sql` reemplaza la RPC activa del carrito por funciones auxiliares invoker, sin cambiar entidades, columnas, PK, FK, cardinalidades, RLS ni datos. El D.E.R. existente continúa representando esas relaciones; no se duplica ni se dibujan funciones como tablas. La definición histórica de 53 líneas queda reemplazada y se conserva. Permisos, transacción y pruebas: [cierre técnico](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/cierre-tecnico-20261105/README.md).
