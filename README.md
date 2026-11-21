# 🛒 Busticaria

**Aplicaciones Web II — Colegio Universitario IES Siglo 21**  
**Autor:** Diego Ahualli

Busticaria es una aplicación web de comercio electrónico que permite consultar productos, navegar por categorías, registrarse, iniciar sesión, administrar un carrito y registrar órdenes de compra. Cuenta con un frontend desarrollado en HTML, CSS y JavaScript y un backend con Node.js y Express.js que expone una API REST.

Los datos de usuarios, productos y ventas se almacenan en **MongoDB Atlas**. El sistema utiliza **Bcrypt** para proteger las contraseñas y **JWT** para autenticar a los usuarios y autorizar las compras.

## Funcionalidades

- Catálogo de productos organizado en las categorías Tecnología, Ropa y Hogar.
- Consulta de productos y disponibilidad de stock.
- Registro de usuarios e inicio de sesión.
- Contraseñas almacenadas mediante hashes Bcrypt.
- Autenticación mediante tokens JWT con expiración de dos horas.
- Carrito de compras con persistencia en `localStorage`.
- Registro de órdenes de compra para usuarios autenticados.
- Validación de cantidades, stock disponible y datos de la compra.
- Cálculo del total desde los precios almacenados en el servidor.
- Descuento de stock y registro de ventas mediante transacciones MongoDB.
- API REST con operaciones CRUD de productos.
- Pruebas de endpoints mediante Postman.

## Tecnologías utilizadas

| Área | Tecnologías |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Bootstrap y Fetch API |
| Backend | Node.js, Express.js y módulos ES |
| Base de datos | MongoDB Atlas y driver oficial `mongodb` |
| Seguridad | `bcrypt` y `jsonwebtoken` |
| Configuración | `dotenv` |
| Pruebas | Postman |
| Versionado | Git y GitHub |

Las dependencias y sus versiones se encuentran en `backend/package.json` y `backend/package-lock.json`.

## Estructura del proyecto

```text
AW2-Busticaria/
├── backend/
│   ├── config/          # Conexión con MongoDB y variables de entorno
│   ├── controllers/     # Lógica de productos, usuarios y ventas
│   ├── middleware/      # Validaciones y autenticación JWT
│   ├── routes/          # Endpoints de la API
│   ├── scripts/         # Migración de datos y pruebas de la API
│   ├── services/        # Servicios auxiliares
│   ├── utils/           # Utilidades de contraseñas, JWT y errores
│   ├── package.json
│   └── server.mjs
├── data/                # Archivos JSON originales para migración
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   └── styles/
├── postman/
│   └── Busticaria-Entrega-4.postman_collection.json
├── .env.example
├── ENTREGA_FINAL.md
└── README.md
```

Las rutas de Express reciben las solicitudes HTTP, los controladores aplican las reglas de negocio y los módulos de configuración administran la conexión con MongoDB. El frontend consume la API mediante `fetch`. Los archivos JSON originales se conservan como fuente de migración; la persistencia activa se realiza en MongoDB.

## Instalación y ejecución

**Requisitos:** Node.js 20 o superior, npm y acceso a una base MongoDB Atlas.

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/DiegoAhualli/AW2-Busticaria.git
   cd AW2-Busticaria
   ```

2. Crear un archivo `.env` en la raíz del proyecto a partir de `.env.example` y completar las variables:

   ```dotenv
   MONGODB_URI=
   JWT_SECRET=
   PORT=3000
   ```

   `MONGODB_URI` corresponde a la conexión de MongoDB Atlas y `JWT_SECRET` debe ser una clave aleatoria de al menos 32 caracteres. El archivo `.env` no se incluye en el repositorio.

3. Instalar las dependencias e iniciar el servidor:

   ```bash
   cd backend
   npm install
   npm start
   ```

4. Abrir `http://localhost:3000` en el navegador.

Para importar los datos iniciales desde los archivos JSON, se puede ejecutar `npm run migrate` desde `backend`. El script valida los registros y evita duplicar sus identificadores.

## Base de datos

La base `busticaria` almacena la información en las colecciones:

- **usuarios:** datos de cuenta, estado y hash de contraseña.
- **productos:** nombre, descripción, categoría, precio, stock, imagen y disponibilidad.
- **ventas:** usuario comprador, productos, cantidades, fecha, dirección y total.
- **contadores:** generación de identificadores numéricos.

Se conservan los IDs numéricos utilizados por el frontend y por las relaciones entre registros. La creación de una venta y el descuento de stock se ejecutan dentro de una transacción para mantener la consistencia de los datos.

## Autenticación y seguridad

El registro de usuarios genera un hash Bcrypt para cada contraseña. El inicio de sesión verifica las credenciales y, si son correctas, emite un JWT válido durante dos horas.

Las compras requieren enviar el encabezado:

```http
Authorization: Bearer TOKEN
```

La compra no confía en el `id_usuario` recibido desde el navegador. Obtiene la identidad de `sub`, consulta que la cuenta continúe activa y rechaza cualquier ID enviado que no coincida.

### Estrategia del navegador

El frontend conserva el token en `sessionStorage`, por lo que se elimina al cerrar la pestaña y no queda persistido indefinidamente. Esta solución es adecuada para el alcance académico y permite enviar Bearer desde `fetch`.

Como limitación, un token accesible desde JavaScript puede quedar expuesto ante una vulnerabilidad XSS. En una versión productiva deberían evaluarse cookies HttpOnly, CSP estricta, refresh tokens y protección CSRF según la arquitectura elegida.

## 🛍️ Integridad de las compras

`POST /api/ventas` ejecuta dentro de una transacción:

1. Validación del JWT y de la cuenta activa.
2. Validación de dirección, IDs, cantidades y productos repetidos.
3. Actualización condicional si todavía existe stock suficiente.
4. Cálculo del total con precios leídos desde MongoDB.
5. Descuento de stock y actualización de `disponible`.
6. Inserción de la venta con `pagada: false`.

Si falla cualquier paso, MongoDB revierte la transacción y la API no confirma la compra. El filtro de stock impide vender más unidades que las disponibles ante solicitudes simultáneas. El servidor comprueba al iniciar que la instancia admita transacciones.

## 📡 Endpoints

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| GET | `/api/productos` | No | Lista el catálogo |
| GET | `/api/productos/:id` | No | Obtiene un producto |
| POST | `/api/productos` | No | Crea un producto |
| PUT | `/api/productos/:id` | No | Actualiza stock y disponibilidad |
| DELETE | `/api/productos/:id` | No | Elimina un producto sin ventas |
| POST | `/api/usuarios` | No | Registra una cuenta con Bcrypt |
| POST | `/api/usuarios/login` | No | Valida credenciales y emite JWT |
| DELETE | `/api/usuarios/:id` | No | Elimina un usuario sin ventas |
| GET | `/api/ventas` | No | Lista las ventas del proyecto |
| POST | `/api/ventas` | Bearer JWT | Registra una compra atómica |

Los endpoints mantienen respuestas JSON y utilizan, según el caso, `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500` o `503`.

## 🧪 Pruebas

### Script integral

Con el servidor iniciado y las variables configuradas:

```bash
npm run test:api
```

El script usa datos ficticios únicos, verifica 36 condiciones y elimina esos datos temporales al finalizar. Incluye CRUD, Bcrypt, login correcto e incorrecto, usuario inactivo, token ausente, inválido y vencido, suplantación de usuario, producto inexistente, stock insuficiente, compra válida, persistencia y dos compras simultáneas por la última unidad.

En las pruebas realizadas se verificaron 36 condiciones, incluyendo autenticación, operaciones CRUD, validaciones de stock, persistencia y solicitudes simultáneas. Las comprobaciones pueden repetirse con `npm run test:api`.

### Postman

Importar:

```text
postman/Busticaria-Entrega-4.postman_collection.json
```

La colección contiene variables para la URL base, token e identificadores de prueba. No contiene la URI de Atlas, el secreto JWT ni credenciales reales.

## 🚀 Mejoras de la cuarta entrega

- Persistencia activa migrada de JSON a MongoDB Atlas.
- Migración segura, verificable e idempotente.
- Índices de unicidad y contadores atómicos.
- Bcrypt para cuentas nuevas y migración de claves planas.
- Compatibilidad y actualización progresiva de cuentas `scrypt`.
- Emisión y validación de JWT.
- Compra autorizada por identidad firmada.
- Transacciones para mantener venta y stock consistentes.
- CRUD completo de productos.
- Frontend adaptado a Bearer JWT sin rediseño visual.
- Pruebas automatizadas y colección Postman.

## Video explicativo

[Ver la presentación de Busticaria en YouTube](https://youtu.be/QZNCGFliHQc)

## Roadmap — Futuras mejoras

Como posibles mejoras para próximas versiones de Busticaria se contemplan:

1. **Recuperación de contraseñas:** permitir restablecer el acceso mediante enlaces temporales enviados por correo electrónico.
2. **Roles y permisos:** diferenciar las funcionalidades disponibles para clientes y administradores.
3. **Historial de pedidos:** incorporar una sección donde cada usuario pueda consultar sus compras y estados.
4. **Despliegue web:** publicar la aplicación en un entorno accesible mediante HTTPS.
5. **Pagos de prueba:** integrar una pasarela de pagos en modo de pruebas, sin efectuar cobros reales.

Estas funcionalidades forman parte de la planificación futura y no están implementadas en la versión actual.

## Alcance

Busticaria es un proyecto académico de ecommerce. Las órdenes de compra se registran en el sistema, pero no se realizan cobros reales ni se utiliza una pasarela de pagos.
