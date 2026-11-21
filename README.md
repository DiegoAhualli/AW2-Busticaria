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

El servidor comprueba el token y obtiene de él la identidad del usuario que realiza la compra. No depende únicamente de un ID enviado desde el navegador.

También se mantiene compatibilidad con las cuentas anteriores que usaban hashes `scrypt`, actualizando su contraseña a Bcrypt tras un inicio de sesión correcto.

## API REST

**URL base:** `http://localhost:3000/api`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/productos` | Listar productos |
| GET | `/productos/:id` | Consultar un producto |
| POST | `/productos` | Registrar un producto |
| PUT | `/productos/:id` | Actualizar stock |
| DELETE | `/productos/:id` | Eliminar un producto sin ventas asociadas |
| POST | `/usuarios` | Registrar usuario |
| POST | `/usuarios/login` | Iniciar sesión y obtener JWT |
| DELETE | `/usuarios/:id` | Eliminar usuario sin ventas asociadas |
| GET | `/ventas` | Consultar ventas |
| POST | `/ventas` | Registrar una compra autenticada |

Las solicitudes y las validaciones de la API se pueden comprobar mediante la colección disponible en `postman/Busticaria-Entrega-4.postman_collection.json`. También se encuentra disponible el comando `npm run test:api` desde la carpeta `backend`.

## Video explicativo

[Ver la presentación de Busticaria en YouTube](https://youtu.be/QZNCGFliHQc)

## Alcance

Busticaria es un proyecto académico de ecommerce. Las órdenes de compra se registran en el sistema, pero no se realizan cobros reales ni se utiliza una pasarela de pagos.
