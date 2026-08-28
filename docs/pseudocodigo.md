# Pseudocódigo DREAMS

## Cargar productos

INICIAR

    solicitar productos a la API

    recibir respuesta

    mostrar productos

FIN

## Buscar y filtrar

INICIAR

    leer texto de búsqueda

    leer marca

    leer género

    leer categoría

    enviar filtros a la API

    recibir productos coincidentes

    mostrar resultados

FIN

## Agregar al carrito

INICIAR

    recibir producto

    leer carrito guardado

    SI el producto ya existe

        aumentar cantidad

    SI NO

        agregar producto con cantidad 1

    FIN SI

    guardar carrito en localStorage

    actualizar contador

FIN

## Favoritos

INICIAR

    verificar sesión

    SI no hay sesión

        pedir inicio de sesión

    SI HAY sesión

        enviar PUT para guardar o DELETE para quitar

        actualizar botón

    FIN SI

FIN

## Login

INICIAR

    recibir correo y contraseña

    enviar datos a API

    verificar credenciales con Supabase Auth

    SI es correcta

        crear cookies HTTP-only de acceso y renovación

    SI NO

        mostrar error

    FIN SI

FIN

## Panel admin

INICIAR

    verificar sesión

    SI usuario es administrador

        mostrar productos

        permitir crear, editar y eliminar

        guardar cambios en Supabase mediante la API

    SI NO

        bloquear acceso

    FIN SI

FIN
