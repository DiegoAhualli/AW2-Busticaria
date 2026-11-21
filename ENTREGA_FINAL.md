# Entrega final - Busticaria

## Datos del trabajo

- **Alumno:** Diego Ahualli
- **Materia:** Aplicaciones Web II
- **Institución:** Colegio Universitario IES Siglo 21
- **Proyecto:** Busticaria
- **Repositorio:** https://github.com/DiegoAhualli/AW2-Busticaria
- **Video explicativo:** PENDIENTE DE INCORPORAR

## Descripción

Busticaria es un ecommerce académico con catálogo, categorías, registro, login, carrito y creación de órdenes. La cuarta entrega completa el backend incorporando MongoDB Atlas, Bcrypt y JSON Web Tokens, conservando las funcionalidades aprobadas en las tres etapas anteriores.

## Tecnologías y dependencias

- HTML, CSS, JavaScript y Bootstrap.
- Node.js y Express.js.
- MongoDB Atlas y driver oficial `mongodb`.
- `bcrypt` para hashing de contraseñas.
- `jsonwebtoken` para autenticación JWT.
- `dotenv` para variables de entorno.
- Fetch API, Postman, Git y GitHub.

## Mejoras implementadas

1. Persistencia operativa migrada desde JSON a `usuarios`, `productos` y `ventas` en MongoDB.
2. Migración repetible que conserva IDs, relaciones y archivos originales.
3. Índices únicos para IDs y emails, más contadores atómicos para altas nuevas.
4. Bcrypt para contraseñas nuevas y conversión controlada de claves planas.
5. Verificación compatible de `scrypt` y actualización a Bcrypt tras un login válido.
6. Login con JWT firmado y expiración de dos horas.
7. Middleware Bearer para proteger `POST /api/ventas`.
8. Identidad de compra tomada del token, no del ID enviado por el navegador.
9. Transacción MongoDB que integra descuento de stock y registro de venta.
10. Frontend adaptado para enviar el JWT sin cambiar su diseño.
11. CRUD completo de productos y protecciones de integridad al eliminar.
12. Colección Postman, migración y script integral de pruebas.

## Arquitectura

- `backend/config`: variables de entorno, conexión e índices MongoDB.
- `backend/routes`: endpoints Express.
- `backend/controllers`: reglas de usuarios, productos, ventas y compras.
- `backend/middleware`: validación de productos y autenticación JWT.
- `backend/services`: generación atómica de IDs.
- `backend/utils`: Bcrypt, compatibilidad `scrypt`, JWT y errores HTTP.
- `backend/scripts`: migración y pruebas integrales.
- `frontend`: interfaz, login y carrito conectados a la API.
- `data`: JSON originales conservados como fuente y respaldo.
- `postman`: colección importable para la demostración.

## Endpoints principales

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

## Pruebas y resultados

Resultados verificados el 20 de noviembre de 2026:

- Atlas contiene 7 usuarios, 11 productos y 5 ventas originales.
- La migración repetida insertó 0 duplicados.
- Contraseñas planas restantes en MongoDB: 0.
- Script integral: 36/36 comprobaciones correctas.
- La prueba simultánea confirmó una compra HTTP 201 y otra HTTP 409 por la última unidad.
- El script eliminó todos sus datos temporales al finalizar.
- El servidor y la API respondieron HTTP 200.

El detalle se encuentra en `INFORME_PRUEBAS.md`. La colección para la demostración es `postman/Busticaria-Entrega-4.postman_collection.json`.

## Decisiones técnicas

- Se conservaron los IDs numéricos para no romper el frontend ni las relaciones históricas.
- La migración usa inserciones por ID y puede repetirse sin duplicar documentos.
- Los hashes `scrypt` se reemplazan por Bcrypt solo después de comprobar la contraseña real.
- El JWT se guarda en `sessionStorage` por el alcance académico y se envía en `Authorization`.
- La compra usa una transacción y actualizaciones condicionales de stock.
- Las órdenes representan compras simuladas y permanecen con `pagada: false`.

## Archivos de apoyo

- `README.md`: documentación técnica completa.
- `INFORME_PRUEBAS.md`: pruebas reales y resultados.
- `.env.example`: variables necesarias sin secretos.
- `postman/Busticaria-Entrega-4.postman_collection.json`: colección de pruebas.

## Pendientes manuales antes de enviar

1. Grabar y publicar el video explicativo.
2. Comprobar los permisos del enlace publicado.
3. Reemplazar el marcador pendiente de este archivo y de `README.md` por el enlace definitivo.
4. Revisar los cambios documentales antes de autorizar commit y push.
