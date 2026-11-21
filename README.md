# 🛒 Busticaria - Aplicaciones Web II

## 👨‍💻 Autor y materia

**Autor:** Diego Ahualli

**Materia:** Aplicaciones Web II

**Institución:** Colegio Universitario IES Siglo 21

**Repositorio:** https://github.com/DiegoAhualli/AW2-Busticaria

## 📖 Descripción

Busticaria es un ecommerce académico iniciado en Aplicaciones Web I y ampliado durante las cuatro entregas de Aplicaciones Web II. Permite consultar productos, filtrar categorías, registrar usuarios, iniciar sesión, administrar un carrito y registrar órdenes de compra simuladas.

La cuarta entrega reemplaza la persistencia operativa en archivos JSON por MongoDB Atlas, almacena las contraseñas nuevas con Bcrypt e incorpora autenticación mediante JSON Web Tokens para autorizar las compras. Los JSON originales se conservan como respaldo y fuente de migración, pero los endpoints ya no escriben en ellos.

## ✨ Funcionalidades

- Catálogo de productos y filtrado por Tecnología, Ropa y Hogar.
- Registro de usuarios con contraseñas Bcrypt.
- Login con emisión de JWT y control de cuentas activas.
- Compatibilidad de acceso para hashes `scrypt` de la tercera entrega.
- Carrito persistido en `localStorage`.
- Token de la sesión guardado temporalmente en `sessionStorage`.
- Compra protegida mediante `Authorization: Bearer TOKEN`.
- Cálculo de precios y total exclusivamente en el backend.
- Validación de productos, cantidades, disponibilidad y stock.
- Descuento de stock y alta de venta dentro de una transacción MongoDB.
- CRUD de productos con operaciones GET, POST, PUT y DELETE.
- Protección de usuarios y productos que tienen ventas relacionadas.
- Migración JSON idempotente, con validación de estructuras y relaciones.
- Colección Postman y script de pruebas integrales.

## 🧰 Tecnologías y dependencias

### Frontend

- HTML5, CSS3 y JavaScript.
- Bootstrap.
- Fetch API.
- `localStorage` para el carrito.
- `sessionStorage` para los datos públicos del usuario y el JWT de la pestaña.

### Backend

- Node.js con módulos ES.
- Express.js.
- Driver oficial `mongodb`.
- `bcrypt` para hashing y comparación de contraseñas.
- `jsonwebtoken` para firma y verificación de JWT.
- `dotenv` para variables de entorno.

Las versiones exactas instaladas están declaradas en `backend/package.json` y `backend/package-lock.json`.

## 📂 Arquitectura

```text
AW2-Busticaria/
├── backend/
│   ├── config/
│   │   ├── entorno.mjs
│   │   └── mongodb.mjs
│   ├── controllers/
│   │   ├── productos.controller.mjs
│   │   ├── usuarios.controller.mjs
│   │   └── ventas.controller.mjs
│   ├── middleware/
│   │   ├── autenticarJWT.mjs
│   │   └── validarProductos.mjs
│   ├── routes/
│   │   ├── productos.mjs
│   │   ├── usuarios.mjs
│   │   └── ventas.mjs
│   ├── scripts/
│   │   ├── migrar-json-mongodb.mjs
│   │   └── probar-api.mjs
│   ├── services/
│   │   └── contadores.mjs
│   ├── utils/
│   │   ├── ErrorHTTP.mjs
│   │   ├── jwt.mjs
│   │   └── passwords.mjs
│   ├── package.json
│   └── server.mjs
├── data/
│   ├── productos.json
│   ├── usuarios.json
│   └── ventas.json
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── index.html
├── postman/
│   └── Busticaria-Entrega-4.postman_collection.json
├── .env.example
├── ENTREGA_FINAL.md
└── README.md
```

Las rutas reciben las solicitudes HTTP, los middleware validan datos o autenticación y los controladores aplican las reglas de negocio. `config/mongodb.mjs` administra una conexión reutilizable, crea los índices y comprueba el soporte de transacciones. La colección interna `contadores` genera IDs numéricos sin consultar el máximo de cada colección en cada alta.

## ⚙️ Instalación y configuración

### Requisitos

- Node.js 20 o superior.
- npm.
- Un clúster MongoDB Atlas accesible desde la IP actual.
- Un usuario de Atlas con permisos de lectura y escritura sobre la base `busticaria`.

### 1. Clonar el repositorio

```bash
git clone https://github.com/DiegoAhualli/AW2-Busticaria.git
cd AW2-Busticaria
```

### 2. Crear `.env` en la raíz

Copiar `.env.example` como `.env` en la **raíz del repositorio**, no dentro de `backend`:

```dotenv
MONGODB_URI=
JWT_SECRET=
PORT=3000
```

Completar `MONGODB_URI` con la URI suministrada por MongoDB Atlas y `JWT_SECRET` con un valor aleatorio de al menos 32 caracteres. Estos valores deben permanecer únicamente en el archivo `.env` local.

Se puede generar un secreto aleatorio localmente con:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

El contenido de `.env` está ignorado por Git. No debe copiarse a la documentación, Postman, capturas ni commits.

### 3. Instalar dependencias

El `package.json` se encuentra dentro de `backend`:

```bash
cd backend
npm install
```

### 4. Migrar los JSON a MongoDB

```bash
npm run migrate
```

La migración:

1. Lee y valida `usuarios.json`, `productos.json` y `ventas.json`.
2. Comprueba IDs, emails y relaciones.
3. Conserva los IDs numéricos históricos.
4. Convierte contraseñas históricas en texto plano a Bcrypt.
5. Conserva temporalmente hashes `scrypt` válidos.
6. Inserta por ID sin duplicar documentos existentes.
7. Crea índices únicos para IDs y email.
8. Inicializa los contadores y verifica las cantidades migradas.

El comando puede repetirse sin duplicar registros. Los archivos JSON originales no se modifican y no funcionan como persistencia operativa.

### 5. Iniciar Busticaria

Desde `backend`:

```bash
npm start
```

Abrir:

- Aplicación: http://localhost:3000
- API de productos: http://localhost:3000/api/productos

Express entrega el frontend y la API desde el mismo origen.

## 🍃 MongoDB

La base lógica utilizada es `busticaria` y contiene:

- `usuarios`: datos de cuenta y hash de contraseña.
- `productos`: catálogo, precio, stock y disponibilidad.
- `ventas`: órdenes y referencias mediante IDs lógicos.
- `contadores`: secuencias internas para generar IDs sin colisiones.

Los índices únicos evitan IDs y emails duplicados. MongoDB agrega `_id`, pero el contrato público conserva `id`, `id_usuario` e `id_producto` para mantener la compatibilidad con el frontend y los datos anteriores.

## 🔐 Bcrypt y contraseñas históricas

Las cuentas nuevas se guardan exclusivamente con Bcrypt y costo 10. La API nunca devuelve el campo `password` ni imprime contraseñas o hashes.

La migración convierte a Bcrypt las claves históricas que estaban en texto plano. Un hash `scrypt` no puede convertirse sin conocer la contraseña original, por eso se verifica con el algoritmo anterior. Después de un login `scrypt` correcto, el servidor crea un hash Bcrypt con la contraseña recién proporcionada y actualiza únicamente ese campo.

## 🎫 Autenticación JWT

`POST /api/usuarios/login` devuelve los datos públicos del usuario y un JWT:

```json
{
  "mensaje": "Inicio de sesión correcto",
  "usuario": {
    "id": 8,
    "nombre": "Usuario",
    "apellido": "Prueba",
    "email": "usuario@example.com",
    "activo": true
  },
  "token": "JWT_GENERADO"
}
```

El token usa HS256, emisor y audiencia definidos y una expiración de dos horas. Solo incluye el ID lógico del usuario en `sub`.

Las compras requieren:

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

Los resultados ejecutados el 20 de noviembre de 2026 están documentados en `INFORME_PRUEBAS.md`.

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

## 🎥 Video explicativo

**Video de la cuarta entrega:** [Ver en YouTube](https://youtu.be/QZNCGFliHQc)

El recorrido utilizado para la demostración está documentado en `GUION_VIDEO.md`.

## Roadmap - Futuras mejoras

Las siguientes funcionalidades son propuestas para versiones futuras y **no están implementadas en la entrega actual**:

- **Recuperación de contraseñas:** envío de un enlace temporal y de un solo uso para establecer una nueva contraseña.
- **Roles y permisos:** diferenciación entre clientes y administradores, con autorización específica para administrar productos, usuarios y ventas.
- **Historial de pedidos:** sección privada para que cada usuario consulte sus órdenes, productos, importes y estados.
- **Despliegue web:** publicación del frontend, la API y MongoDB en servicios administrados con HTTPS y variables de entorno seguras.
- **Pagos de prueba:** integración con el entorno sandbox de una pasarela de pagos, sin realizar cobros reales.

## ℹ️ Alcance

Busticaria registra órdenes simuladas y no incluye una pasarela de pagos. Las ventas nuevas permanecen con `pagada: false`. El proyecto mantiene un alcance académico y no implementa recuperación pública de contraseñas, refresh tokens, roles administrativos ni despliegue productivo.

---

**Aplicaciones Web II - Colegio Universitario IES Siglo 21**

**Desarrollado por Diego Ahualli**
