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
