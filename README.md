# Busticaria - Aplicaciones Web II

## Autor

Diego Ahualli

---

# Descripción

Busticaria es una aplicación web de ecommerce desarrollada originalmente como trabajo integrador para la materia Aplicaciones Web I del colegio universitario IES 21.

Durante Aplicaciones Web I se desarrolló el Front-End de la aplicación, incorporando navegación, autenticación simulada, categorías de productos, carrito de compras, consumo de una API externa y persistencia de información mediante Web Storage.

Este repositorio corresponde a la continuación del proyecto para la materia Aplicaciones Web II, donde se comenzará a trabajar sobre el desarrollo del Back-End de la aplicación.

---

# Primera Entrega

Como primera etapa de Aplicaciones Web II se crearon estructuras de datos en formato JSON que representan información relacionada con el funcionamiento del ecommerce.

Se utilizaron tres archivos:

- `usuarios.json`
- `productos.json`
- `ventas.json`

Los datos se encuentran relacionados entre sí mediante identificadores.

---

## usuarios.json

Contiene la información de los usuarios registrados en la aplicación.

Cada usuario posee datos como:

- ID
- Nombre
- Apellido
- Email
- Contraseña
- Estado de la cuenta

Ejemplo de estructura:

```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan.perez@gmail.com",
  "password": "juan123",
  "activo": true
}



---

# Segunda entrega - API REST con Express.js

En esta etapa se desarrolló un servidor utilizando Node.js y Express.js para gestionar los datos de Busticaria mediante solicitudes HTTP.

La aplicación utiliza tres archivos JSON:
- usuarios.json
- productos.json
- ventas.json

## Tecnologías utilizadas

- JavaScript
- Node.js
- Express.js
- JSON
- Postman

## Instalación y ejecución

1. Clonar el repositorio.
2. Abrir la carpeta del proyecto.
3. Instalar las dependencias con `npm install`.
4. Iniciar el servidor con `node server.mjs`.

El servidor se ejecuta en:

http://localhost:3000

## Rutas implementadas

| Método | Ruta | Descripción |
|---|---|---|
| GET | / | Bienvenida a la API |
| GET | /api/productos | Consultar todos los productos |
| GET | /api/ventas | Consultar todas las ventas |
| POST | /api/usuarios | Registrar un nuevo usuario |
| POST | /api/productos | Registrar un nuevo producto |
| PUT | /api/productos/:id | Actualizar el stock de un producto |
| DELETE | /api/usuarios/:id | Eliminar un usuario sin ventas relacionadas |

## Funcionamiento

Las solicitudes GET permiten consultar los datos almacenados en los archivos JSON.

Las solicitudes POST permiten agregar nuevos usuarios y productos.

La solicitud PUT permite modificar el stock de un producto existente y actualizar su disponibilidad.

La solicitud DELETE permite eliminar un usuario, siempre que no tenga ventas registradas. De esta manera, se mantiene la integridad de los datos.

Los endpoints devuelven códigos de estado HTTP según el resultado de cada solicitud.

## Pruebas

Las rutas fueron probadas utilizando Postman.

## Autor

Diego Ahualli

Aplicaciones Web II - IES Siglo 21