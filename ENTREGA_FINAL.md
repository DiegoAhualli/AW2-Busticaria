# Entrega final - Busticaria

## Datos del trabajo

- **Alumno:** Diego Ahualli
- **Materia:** Aplicaciones Web II
- **Institución:** Colegio Universitario IES Siglo 21
- **Proyecto:** Busticaria
- **Repositorio:** https://github.com/DiegoAhualli/AW2-Busticaria
- **Video explicativo:** PENDIENTE DE INCORPORAR

## Descripción

Busticaria es un ecommerce académico con catálogo, categorías, registro, login, carrito y creación de órdenes. La cuarta entrega incorpora MongoDB Atlas, Bcrypt y JSON Web Tokens, conservando las funcionalidades aprobadas en las etapas anteriores.

## Tecnologías

- HTML, CSS, JavaScript y Bootstrap.
- Node.js y Express.js.
- MongoDB Atlas y driver oficial `mongodb`.
- `bcrypt`, `jsonwebtoken` y `dotenv`.
- Fetch API, Postman, Git y GitHub.

## Mejoras implementadas

1. Persistencia activa migrada desde JSON a MongoDB.
2. Migración idempotente que conserva IDs y relaciones.
3. Índices únicos y contadores atómicos.
4. Bcrypt para cuentas nuevas y migración de claves planas.
5. Compatibilidad `scrypt` con actualización progresiva a Bcrypt.
6. Login con JWT firmado y expiración de dos horas.
7. Middleware Bearer para proteger las compras.
8. Identidad de compra obtenida del JWT.
9. Transacciones para integrar venta y descuento de stock.
10. Frontend adaptado sin modificar su diseño.
11. CRUD completo de productos.
12. Colección Postman y pruebas automatizadas.

## Endpoints

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Consultar un producto |
| POST | `/api/productos` | Crear un producto |
| PUT | `/api/productos/:id` | Actualizar stock |
| DELETE | `/api/productos/:id` | Eliminar producto sin ventas |
| POST | `/api/usuarios` | Registrar usuario con Bcrypt |
| POST | `/api/usuarios/login` | Iniciar sesión y obtener JWT |
| DELETE | `/api/usuarios/:id` | Eliminar usuario sin ventas |
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/ventas` | Comprar con Bearer JWT |

## Instalación resumida

```bash
git clone https://github.com/DiegoAhualli/AW2-Busticaria.git
cd AW2-Busticaria
# Crear .env en la raíz a partir de .env.example
cd backend
npm install
npm run migrate
npm start
```

Aplicación: http://localhost:3000

## Resultados verificados

- Base utilizada: `busticaria`.
- Migración repetida sin duplicados.
- 7 usuarios, 11 productos y 5 ventas originales verificados.
- 0 contraseñas planas en MongoDB.
- Pruebas integrales: 36/36 correctas.
- Concurrencia: una compra aceptada y otra rechazada al competir por la última unidad.

El detalle está en `INFORME_PRUEBAS.md` y la colección importable en `postman/Busticaria-Entrega-4.postman_collection.json`.

## Pendientes manuales

1. Grabar y publicar el video.
2. Comprobar los permisos del enlace.
3. Reemplazar el marcador pendiente de este archivo y de `README.md`.
4. Revisar los cambios antes de autorizar commit y push.
