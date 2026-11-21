# Busticaria — Entrega final de Aplicaciones Web II

**Alumno:** Diego Ahualli  
**Institución:** Colegio Universitario IES Siglo 21  
**Materia:** Aplicaciones Web II  
**Proyecto:** Busticaria  
**Repositorio:** https://github.com/DiegoAhualli/AW2-Busticaria  
**Video explicativo:** https://youtu.be/QZNCGFliHQc

## 1. Descripción general

Busticaria es una aplicación web de comercio electrónico desarrollada de manera progresiva a partir del frontend realizado en Aplicaciones Web I. Durante Aplicaciones Web II se incorporó una API REST con Node.js y Express.js, se conectaron las funcionalidades del sitio con el servidor y se implementó la persistencia de usuarios, productos y ventas.

En la cuarta entrega se reemplazó el almacenamiento operativo basado en archivos JSON por MongoDB Atlas y se incorporaron mecanismos de seguridad para el registro, el inicio de sesión y las compras. La aplicación conserva el catálogo por categorías, el carrito de compras y el registro de órdenes simuladas.

## 2. Arquitectura y documentación técnica

El proyecto se organiza en las siguientes áreas:

- **`frontend/`**: páginas HTML, estilos, componentes JavaScript y comunicación con la API mediante `fetch`.
- **`backend/routes/`**: definición de los endpoints de usuarios, productos y ventas.
- **`backend/controllers/`**: validaciones y reglas de negocio.
- **`backend/middleware/`**: validaciones de productos y autenticación JWT.
- **`backend/config/`**: configuración de variables de entorno y conexión a MongoDB.
- **`backend/services/` y `backend/utils/`**: generación de identificadores y funciones auxiliares.
- **`backend/scripts/`**: migración desde JSON y pruebas automatizadas.
- **`data/`**: archivos JSON originales conservados como fuente de migración y respaldo; ya no constituyen la persistencia activa.
- **`postman/`**: colección de solicitudes para comprobar el funcionamiento de la API.

Express entrega las páginas del frontend y responde a las solicitudes de la API desde el mismo servidor. Las operaciones de lectura y modificación de datos utilizan MongoDB.

La base `busticaria` utiliza colecciones para **usuarios**, **productos** y **ventas**. También se utiliza una colección interna de contadores para administrar los IDs numéricos. Se conservaron los identificadores de las entidades y las referencias entre ellas al migrar la información.

## 3. Tecnologías y dependencias

| Tecnología | Utilización |
|---|---|
| HTML5, CSS3 y Bootstrap | Estructura, estilos y presentación responsive |
| JavaScript | Interacción del frontend y lógica del backend |
| Node.js | Entorno de ejecución del servidor |
| Express.js | API REST y entrega de archivos estáticos |
| MongoDB Atlas | Persistencia de usuarios, productos y ventas |
| `mongodb` | Driver oficial para conectar Node.js con MongoDB |
| `bcrypt` | Generación y comparación de hashes de contraseñas |
| `jsonwebtoken` | Emisión y validación de JWT |
| `dotenv` | Lectura de variables de entorno |
| Fetch API | Solicitudes HTTP desde el navegador |
| Postman | Pruebas manuales de los endpoints |
| Git y GitHub | Control de versiones y entrega |

Las versiones utilizadas se encuentran declaradas en `backend/package.json` y `backend/package-lock.json`.

## 4. Funcionalidades y mejoras implementadas

### Migración a MongoDB

Los registros originalmente almacenados en `usuarios.json`, `productos.json` y `ventas.json` se migraron a MongoDB Atlas. La migración conserva IDs y relaciones, valida las estructuras y evita duplicar registros al ejecutarse nuevamente.

Los archivos originales permanecen en `data/` como respaldo, pero la API trabaja sobre la base de datos.

### Protección de contraseñas con Bcrypt

Las cuentas nuevas almacenan sus contraseñas como hashes Bcrypt y el inicio de sesión valida las credenciales sin devolver el campo de contraseña en las respuestas.

Para conservar la compatibilidad con usuarios anteriores, las contraseñas antiguas en texto plano se transformaron durante la migración; las cuentas con hashes `scrypt` pueden seguir autenticándose y actualizar su hash a Bcrypt al iniciar sesión correctamente.

### Autenticación y autorización con JWT

La ruta `POST /api/usuarios/login` verifica las credenciales y emite un token JWT con una validez de dos horas.

Para registrar una compra, el cliente debe enviar el token mediante el encabezado `Authorization: Bearer TOKEN`. El servidor valida su firma, vigencia y usuario asociado. La identidad de quien compra se determina a partir del token, no de un identificador proporcionado libremente por el navegador.

### Compra y control de stock

El servidor comprueba la existencia del producto, su disponibilidad y la cantidad solicitada. El total se calcula a partir de los precios almacenados en MongoDB. El registro de la venta y el descuento de stock se realizan dentro de una transacción, para mantener la consistencia de ambas operaciones.

Se mantiene el carácter académico de la tienda: las ventas registradas no representan pagos reales.

### Integración con el frontend

Se conservaron la navegación por categorías, el catálogo, el registro de usuarios, el inicio de sesión y el carrito. Se adaptó la comunicación con el backend para trabajar con MongoDB y enviar el JWT en las compras, sin rediseñar la interfaz.

## 5. Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Consultar producto por ID |
| POST | `/api/productos` | Registrar producto |
| PUT | `/api/productos/:id` | Modificar stock |
| DELETE | `/api/productos/:id` | Eliminar producto sin ventas asociadas |
| POST | `/api/usuarios` | Registrar usuario |
| POST | `/api/usuarios/login` | Iniciar sesión y obtener JWT |
| DELETE | `/api/usuarios/:id` | Eliminar usuario sin ventas asociadas |
| GET | `/api/ventas` | Consultar ventas |
| POST | `/api/ventas` | Registrar compra con JWT obligatorio |

La API devuelve respuestas JSON y utiliza códigos HTTP adecuados a cada resultado, como `200`, `201`, `400`, `401`, `404` y `409`.

## 6. Instalación y ejecución

Se requiere Node.js, npm y una conexión autorizada a MongoDB Atlas.

1. Clonar el repositorio: `git clone https://github.com/DiegoAhualli/AW2-Busticaria.git`.
2. Crear el archivo `.env` en la raíz del proyecto a partir de `.env.example`.
3. Completar localmente `MONGODB_URI` y `JWT_SECRET`; no subir esos valores a GitHub.
4. Ingresar a `backend/` y ejecutar `npm install`.
5. Ejecutar `npm run migrate` cuando sea necesario importar los datos iniciales.
6. Iniciar el servidor con `npm start`.
7. Abrir `http://localhost:3000` en el navegador.

El procedimiento completo está ampliado en el [README del repositorio](https://github.com/DiegoAhualli/AW2-Busticaria/blob/main/README.md).

## 7. Pruebas

Se realizaron pruebas manuales en Postman y pruebas automatizadas mediante `npm run test:api`. Entre las verificaciones realizadas se incluyen:

- Las cuatro operaciones CRUD de productos.
- Registro de usuarios y validación de credenciales.
- Inicio de sesión con JWT.
- Rechazo de compras sin token o con token inválido.
- Rechazo de compras por stock insuficiente.
- Registro de ventas autenticadas y actualización del stock.
- Persistencia de la información en MongoDB.
- Solicitudes concurrentes sobre la última unidad disponible.

La ejecución integral reportó **36 comprobaciones correctas de 36**. La colección de solicitudes está disponible en [`postman/Busticaria-Entrega-4.postman_collection.json`](https://github.com/DiegoAhualli/AW2-Busticaria/blob/main/postman/Busticaria-Entrega-4.postman_collection.json).

## 8. Roadmap — Futuras mejoras

Como posibles ampliaciones del proyecto se consideran:

1. Recuperación de contraseñas mediante enlaces temporales.
2. Roles y permisos diferenciados para administradores y clientes.
3. Historial de pedidos consultable por cada usuario.
4. Publicación de la aplicación en un entorno con HTTPS.
5. Integración de una pasarela de pagos en modalidad de prueba.

Estas mejoras forman parte de la evolución propuesta y **no están implementadas en la versión actual**.

## 9. Video y repositorio

**Video explicativo:** https://youtu.be/QZNCGFliHQc

El video presenta la aplicación, la arquitectura general, las operaciones CRUD, el inicio de sesión, la autorización mediante JWT, las pruebas con Postman y la persistencia en MongoDB.

**Repositorio de entrega:** https://github.com/DiegoAhualli/AW2-Busticaria

No se incluye enlace de despliegue porque la publicación en un servidor es opcional y esta entrega se ejecuta de forma local con MongoDB Atlas.
