
# 🛒 Busticaria - Aplicaciones Web II

## 👨‍💻 Autor

**Diego Ahualli**

---

## 📖 Descripción

**Busticaria** es una aplicación web de ecommerce que comencé a desarrollar en Aplicaciones Web I y que continué en Aplicaciones Web II, en el Colegio Universitario IES 21.

En **AW1** trabajé principalmente con el frontend: páginas HTML, estilos, navegación, categorías, carrito de compras, un login simulado y almacenamiento en el navegador.

En **AW2** incorporé un servidor con Node.js y Express.js para trabajar con datos propios en formato JSON y conectar las funcionalidades del frontend con el backend.

Este documento describe las primeras tres entregas del trabajo práctico. La cuarta entrega corresponde a la integración con una base de datos no relacional y autenticación.

---

## 🛠️ Tecnologías utilizadas

- **HTML, CSS y JavaScript:** desarrollo del frontend.
- **Bootstrap:** estilos y diseño responsive.
- **Node.js:** entorno de ejecución del servidor.
- **Express.js:** servidor y rutas de la API REST.
- **JSON:** almacenamiento de usuarios, productos y ventas.
- **Fetch API:** comunicación entre frontend y backend.
- **localStorage:** persistencia del carrito de compras.
- **sessionStorage:** almacenamiento de la sesión simulada.
- **Postman:** pruebas de los endpoints.
- **Git y GitHub:** control de versiones.

---

# 📦 Primera entrega - Estructuras JSON

En esta primera entrega creé las estructuras de datos que utiliza el ecommerce.

Los archivos se encuentran en la carpeta `data/`:

- `usuarios.json`
- `productos.json`
- `ventas.json`

## 1. usuarios.json

Contiene la información de las cuentas registradas.

Cada usuario tiene:

- ID.
- Nombre.
- Apellido.
- Email.
- Contraseña.
- Estado de la cuenta (activo o inactivo).

En la integración posterior con el backend, incorporé el almacenamiento de contraseñas nuevas mediante un hash con `scrypt`.

Los registros de ejemplo iniciales se mantienen por compatibilidad.

## 2. productos.json

Contiene los productos que ofrece Busticaria.

Cada producto tiene:

- ID.
- Nombre.
- Descripción.
- Categoría.
- Precio.
- Stock.
- Imagen.
- Disponibilidad.

Las categorías utilizadas son:

- Tecnología.
- Ropa.
- Hogar.

## 3. ventas.json

Contiene las órdenes de compra registradas.

Cada venta tiene:

- ID de venta.
- ID del usuario.
- Fecha.
- Total.
- Dirección de entrega.
- Estado de pago.
- Productos comprados y sus cantidades.

Los archivos se relacionan mediante identificadores.

Por ejemplo, el campo `id_usuario` indica quién realizó la compra y `id_producto` identifica cada artículo comprado.

---

# 🌐 Segunda entrega - API REST con Express.js

En la segunda entrega desarrollé un servidor con Node.js y Express.js para consultar y modificar los datos almacenados en los archivos JSON.

Organicé las rutas según el recurso que administran:

- `backend/routes/productos.mjs`
- `backend/routes/usuarios.mjs`
- `backend/routes/ventas.mjs`

También creé `data/archivos.mjs`, que contiene las funciones:

- `leerJSON()`
- `guardarJSON()`

Estas funciones utilizan `fs/promises` para leer y escribir archivos de manera asíncrona, evitando repetir el mismo código en cada endpoint.

## Endpoints implementados

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Consultar todos los productos |
| GET | `/api/ventas` | Consultar las ventas registradas |
| POST | `/api/productos` | Registrar un producto nuevo |
| POST | `/api/usuarios` | Registrar un usuario nuevo |
| PUT | `/api/productos/:id` | Actualizar el stock de un producto |
| DELETE | `/api/usuarios/:id` | Eliminar un usuario sin ventas relacionadas |

## Funcionamiento de las rutas

### GET - Consultar información

Permite obtener los productos y las ventas almacenadas en los archivos JSON.

### POST - Registrar información

Permite incorporar nuevos productos y usuarios, realizando validaciones antes de guardar los cambios.

### PUT - Actualizar información

Permite modificar el stock de un producto existente y actualizar su disponibilidad.

### DELETE - Eliminar información

Permite eliminar un usuario siempre que no tenga ventas registradas.

Esta validación evita dejar ventas relacionadas con usuarios que ya no existen.

Los endpoints devuelven respuestas JSON y códigos de estado HTTP según el resultado de cada operación.

Las rutas fueron trabajadas y probadas utilizando **Postman**.

---

# 🛍️ Tercera entrega - Integración de Frontend y Backend

En esta entrega conecté el frontend que había desarrollado en Aplicaciones Web I con el servidor Express de Aplicaciones Web II.

El objetivo fue utilizar nuestros propios datos JSON para mostrar productos, registrar usuarios y generar órdenes de compra.

## 1. Listado de productos

El Home obtiene los productos mediante una solicitud:

`GET /api/productos`

La consulta se realiza utilizando `fetch()` desde `home.controller.js`.

Los productos se muestran mediante el componente `crearCardProducto()`, que genera las tarjetas HTML.

Se muestran solamente los productos que están disponibles y tienen stock mayor a cero.

**Archivos principales:**

- `frontend/pages/home.controller.js`
- `frontend/components/card.component.js`
- `backend/routes/productos.mjs`
- `backend/controllers/productos.controller.mjs`

## 2. Filtrado por categorías

Busticaria tiene tres categorías:

- **Tecnología**
- **Ropa**
- **Hogar**

Las tres páginas utilizan el mismo controlador: `categoria.controller.js`.

Este controlador identifica la página abierta, consulta los productos al servidor y filtra los resultados según el campo `categoria`.

De esta forma evitamos crear un controlador diferente para cada sección.

También permite seleccionar cantidades y agregar productos al carrito.

**Archivo principal:**

`frontend/pages/categories/categoria.controller.js`

## 3. Registro de usuarios

El formulario de registro está conectado con el endpoint:

`POST /api/usuarios`

Cuando el usuario completa el formulario, JavaScript obtiene los datos y los envía al backend mediante `fetch()`.

Express realiza las validaciones correspondientes, comprueba que el email no esté registrado y guarda el nuevo usuario en `usuarios.json`.

Las contraseñas nuevas se almacenan utilizando un hash con `scrypt`.

Una vez registrado, el usuario es redirigido a la pantalla de login.

**Archivos principales:**

- `frontend/pages/auth/signin/registro.controller.js`
- `backend/routes/usuarios.mjs`
- `backend/controllers/usuarios.controller.mjs`

## 4. Inicio de sesión

Para iniciar sesión se utiliza:

`POST /api/usuarios/login`

El frontend envía el email y la contraseña al servidor.

Express busca la cuenta, verifica las credenciales y comprueba que el usuario esté activo.

Si los datos son correctos, devuelve la información pública de la cuenta.

El frontend guarda esa información en `sessionStorage`, incluyendo el ID del usuario.

Este ID se utiliza posteriormente para relacionar una orden de compra con el usuario que la realizó.

No se guarda la contraseña en la sesión del navegador.

**Archivos principales:**

- `frontend/pages/auth/login/login.controller.js`
- `backend/routes/usuarios.mjs`
- `backend/controllers/usuarios.controller.mjs`

## 5. Carrito de compras

El carrito utiliza `localStorage` para conservar los productos seleccionados.

De esta manera, los productos continúan guardados aunque el usuario cambie de página o recargue el navegador.

**Funcionalidades implementadas:**

- Agregar productos.
- Aumentar cantidades.
- Disminuir cantidades.
- Eliminar productos.
- Consultar el subtotal de cada artículo.
- Consultar el total estimado.

Antes de aumentar cantidades se comprueba el stock informado por el servidor.

**Archivo principal:**

`frontend/pages/carrito/carrito.controller.js`

## 6. Registro de compras

Esta funcionalidad conecta el carrito con el backend.

Cuando el usuario realiza una compra, debe ingresar una dirección de entrega y confirmar la operación.

El frontend envía una solicitud:

`POST /api/ventas`

**Datos enviados:**

- ID del usuario.
- Dirección de entrega.
- ID de cada producto.
- Cantidad de cada producto.

**El backend se encarga de:**

1. Validar los datos recibidos.
2. Verificar que el usuario exista y esté activo.
3. Comprobar que los productos existan.
4. Controlar que haya stock suficiente.
5. Calcular el total utilizando los precios guardados en `productos.json`.
6. Descontar el stock de los productos comprados.
7. Registrar la nueva orden en `ventas.json`.
8. Devolver una confirmación con el ID y el total de la compra.

El carrito se vacía únicamente cuando el servidor confirma que la orden fue registrada.

Si la operación es rechazada, los productos permanecen en el carrito.

Las compras nuevas se registran con `pagada: false`, ya que este trabajo simula el registro de una orden y no incorpora pagos reales.

**Archivos principales:**

- `backend/routes/ventas.mjs`
- `backend/controllers/ventas.controller.mjs`
- `frontend/pages/carrito/carrito.controller.js`
- `data/productos.json`
- `data/ventas.json`

---

# 📂 Estructura del proyecto

```text
AW2-Busticaria/
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── productos.controller.mjs
│   │   ├── usuarios.controller.mjs
│   │   └── ventas.controller.mjs
│   │
│   ├── middleware/
│   │   └── validarProductos.mjs
│   │
│   ├── routes/
│   │   ├── productos.mjs
│   │   ├── usuarios.mjs
│   │   └── ventas.mjs
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── server.mjs
│
├── data/
│   ├── archivos.mjs
│   ├── productos.json
│   ├── usuarios.json
│   └── ventas.json
│
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── index.html
│
├── .gitignore
└── README.md
```

## Organización del backend

A partir de la devolución docente de la tercera entrega, se reorganizó el backend utilizando **controladores y middleware** para separar responsabilidades.

### Routes

Contienen los endpoints de Express correspondientes a productos, usuarios y ventas.

Cada ruta establece qué controlador debe ejecutarse cuando llega una solicitud HTTP.

### Controllers

Contienen la lógica de cada recurso, incluyendo consultas, registros, actualizaciones y validaciones de negocio.

Los controladores se encuentran separados en:

- `productos.controller.mjs`
- `usuarios.controller.mjs`
- `ventas.controller.mjs`

### Middleware

Permite validar las solicitudes antes de ejecutar los controladores.

En Productos se utiliza `validarProductos.mjs` para verificar los datos recibidos antes de crear productos o actualizar stock.

### Data

Contiene los archivos JSON y las funciones compartidas de lectura y escritura.

Esta reorganización permite mantener el código más ordenado, facilita su mantenimiento y conserva las funcionalidades implementadas.

También se corrigió la configuración del archivo `package.json` para utilizar módulos ECMAScript y permitir el inicio del servidor mediante `npm start`.

La persistencia continúa realizándose mediante archivos JSON. La integración con bases de datos NoSQL corresponde a la cuarta entrega del trabajo práctico.

---

# 🚀 Instalación y ejecución

## Requisitos

- Tener instalado Node.js.
- Tener npm disponible.
- Contar con un navegador web.
- Tener Git instalado para clonar el repositorio.

## Pasos para ejecutar Busticaria

### 1. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/DiegoAhualli/AW2-Busticaria.git
```

### 2. Ingresar a la carpeta del backend

```bash
cd AW2-Busticaria/backend
```

**Importante:** los siguientes comandos deben ejecutarse dentro de la carpeta `backend`, ya que allí se encuentra el archivo `package.json`.

### 3. Instalar las dependencias

```bash
npm install
```

Este comando instala las dependencias necesarias para ejecutar el servidor Express.

### 4. Iniciar el servidor

```bash
npm start
```

Si todo funciona correctamente, la consola mostrará:

```text
Busticaria: http://localhost:3000/pages/home.html
API productos: http://localhost:3000/api/productos
```

### 5. Abrir la aplicación

Ingresar desde el navegador a:

**http://localhost:3000**

El servidor redirige automáticamente a la página principal de Busticaria.

También se puede consultar directamente el listado de productos desde:

**http://localhost:3000/api/productos**

Es importante ejecutar el frontend desde Express, ya que necesita comunicarse con las rutas de la API.

Para detener el servidor, utilizar `Ctrl + C` en la terminal.

---

# 🧪 Guía de pruebas para el docente

Para comprobar el funcionamiento de la tercera entrega, se puede realizar el siguiente recorrido:

1. Abrir el Home y verificar que aparezcan los productos disponibles.
2. Ingresar a las categorías Tecnología, Ropa y Hogar.
3. Comprobar que cada página muestre los productos correspondientes.
4. Registrar un usuario de prueba.
5. Iniciar sesión con ese usuario.
6. Seleccionar un producto y agregarlo al carrito.
7. Cambiar de página y volver al carrito para verificar que se conserve.
8. Modificar las cantidades de los productos.
9. Ingresar una dirección y confirmar la compra.
10. Consultar `data/ventas.json` para comprobar que se registró la orden.
11. Consultar `data/productos.json` para comprobar que se descontó el stock.
12. Realizar una prueba con stock insuficiente para verificar que la operación sea rechazada.

## Pruebas de endpoints con Postman

Para revisar la segunda entrega también se pueden probar los endpoints GET, POST, PUT y DELETE utilizando Postman.

| Método | Endpoint | Funcionalidad |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/productos` | Registrar producto |
| POST | `/api/usuarios` | Registrar usuario |
| POST | `/api/usuarios/login` | Iniciar sesión |
| POST | `/api/ventas` | Registrar compra |
| PUT | `/api/productos/:id` | Modificar stock |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |

**URL base de la API:**

`http://localhost:3000/api`

Las operaciones que modifican datos quedan guardadas en los archivos JSON, por lo que se recomienda utilizar información ficticia durante las pruebas y conservar una copia de los datos originales.

---

# 🔐 Alcance del proyecto

Busticaria fue desarrollado como un proyecto académico para la materia **Aplicaciones Web II**.

Para esta etapa se utilizaron archivos JSON como mecanismo de persistencia, sin incorporar todavía una base de datos.

La aplicación utiliza `sessionStorage` para simular el estado de inicio de sesión en el frontend.

Este mecanismo no representa una autenticación segura en el servidor, ya que todavía no se implementaron tokens de acceso ni mecanismos de autorización para las operaciones protegidas.

Las contraseñas de las cuentas nuevas se almacenan utilizando un hash con `scrypt`, mientras que las cuentas de ejemplo iniciales mantienen compatibilidad con el formato anterior.

Tampoco se implementó una pasarela de pagos, por lo que las órdenes nuevas se registran como pendientes de pago.

El objetivo principal de la tercera entrega fue **integrar el frontend con Express, consumir la API propia y registrar las operaciones del ecommerce utilizando archivos JSON**.

La incorporación de bases de datos no relacionales y autenticación mediante tokens corresponde a la cuarta entrega.

---

**Aplicaciones Web II - Colegio Universitario IES 21**

**Desarrollado por Diego Ahualli**
