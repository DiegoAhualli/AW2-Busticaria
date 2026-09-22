
import express from 'express';
import fs from 'node:fs/promises';

// Crear el servidor
const app = express();
const PORT = 3000;

// Permitir recibir datos JSON
app.use(express.json());

// --------------------------------------------
// FUNCIONES PARA LEER Y GUARDAR ARCHIVOS JSON
// --------------------------------------------

// Leer un archivo JSON
async function leerJSON(archivo) {
    const datos = await fs.readFile(archivo, 'utf-8');
    return JSON.parse(datos);
}

// Guardar un archivo JSON
async function guardarJSON(archivo, datos) {
    await fs.writeFile(
        archivo,
        JSON.stringify(datos, null, 2),
        'utf-8'
    );
}

// --------------------------------------------
// RUTA DE BIENVENIDA
// --------------------------------------------

app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: '¡Bienvenido a la API de Busticaria!'
    });
});

// --------------------------------------------
// GET 1 - CONSULTAR TODOS LOS PRODUCTOS
// --------------------------------------------

app.get('/api/productos', async (req, res) => {

    try {
        const productos = await leerJSON('./productos.json');

        res.status(200).json(productos);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar los productos'
        });
    }

});

// --------------------------------------------
// GET 2 - CONSULTAR TODAS LAS VENTAS
// --------------------------------------------

app.get('/api/ventas', async (req, res) => {

    try {
        const ventas = await leerJSON('./ventas.json');

        res.status(200).json(ventas);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar las ventas'
        });
    }

});

// --------------------------------------------
// POST 1 - REGISTRAR UN NUEVO USUARIO
// --------------------------------------------

app.post('/api/usuarios', async (req, res) => {

    try {
        // Recibir los datos del usuario
        const { nombre, apellido, email, password } = req.body;

        // Validar los campos obligatorios
        if (
            typeof nombre !== 'string' || !nombre.trim() ||
            typeof apellido !== 'string' || !apellido.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Leer los usuarios existentes
        const usuarios = await leerJSON('./usuarios.json');

        // Comprobar que el email no esté registrado
        const existeEmail = usuarios.some(
            usuario => usuario.email.toLowerCase() === email.toLowerCase()
        );

        if (existeEmail) {
            return res.status(400).json({
                mensaje: 'El email ya está registrado'
            });
        }

        // Generar un nuevo ID
        const nuevoId = Math.max(0, ...usuarios.map(u => u.id)) + 1;

        // Crear el usuario
        const nuevoUsuario = {
            id: nuevoId,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            password: password,
            activo: true
        };

        // Agregarlo al arreglo
        usuarios.push(nuevoUsuario);

        // Guardar los cambios en el JSON
        await guardarJSON('./usuarios.json', usuarios);

        // Responder al cliente
        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            id: nuevoId
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar el usuario'
        });
    }

});

// --------------------------------------------
// POST 2 - REGISTRAR UN NUEVO PRODUCTO
// --------------------------------------------

app.post('/api/productos', async (req, res) => {

    try {
        // Recibir los datos del producto
        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            imagen
        } = req.body;

        // Validar los datos recibidos
        if (
            typeof nombre !== 'string' || !nombre.trim() ||
            typeof descripcion !== 'string' || !descripcion.trim() ||
            typeof categoria !== 'string' || !categoria.trim() ||
            typeof imagen !== 'string' || !imagen.trim() ||
            typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0 ||
            !Number.isInteger(stock) || stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'Los datos del producto son incorrectos'
            });
        }

        // Leer los productos existentes
        const productos = await leerJSON('./productos.json');

        // Generar un nuevo ID
        const nuevoId = Math.max(0, ...productos.map(p => p.id)) + 1;

        // Crear el producto
        const nuevoProducto = {
            id: nuevoId,
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria: categoria.trim(),
            precio: precio,
            stock: stock,
            imagen: imagen.trim(),
            disponible: stock > 0
        };

        // Agregarlo al arreglo
        productos.push(nuevoProducto);

        // Guardar los cambios
        await guardarJSON('./productos.json', productos);

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            producto: nuevoProducto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar el producto'
        });
    }

});

// --------------------------------------------
// PUT - ACTUALIZAR EL STOCK DE UN PRODUCTO
// --------------------------------------------

app.put('/api/productos/:id', async (req, res) => {

    try {
        // Obtener el ID desde la URL
        const id = Number(req.params.id);

        // Obtener el nuevo stock desde el body
        const { stock } = req.body;

        // Validar los datos
        if (
            !Number.isInteger(id) || id <= 0 ||
            !Number.isInteger(stock) || stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'El ID o el stock son incorrectos'
            });
        }

        // Leer los productos
        const productos = await leerJSON('./productos.json');

        // Buscar el producto por su ID
        const producto = productos.find(p => p.id === id);

        // Comprobar si existe
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        // Actualizar el stock
        producto.stock = stock;

        // Actualizar la disponibilidad
        producto.disponible = stock > 0;

        // Guardar los cambios
        await guardarJSON('./productos.json', productos);

        res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            producto: producto
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el producto'
        });
    }

});

// --------------------------------------------
// DELETE - ELIMINAR UN USUARIO
// --------------------------------------------

app.delete('/api/usuarios/:id', async (req, res) => {

    try {
        // Obtener el ID desde la URL
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID es incorrecto'
            });
        }

        // Leer usuarios y ventas
        const usuarios = await leerJSON('./usuarios.json');
        const ventas = await leerJSON('./ventas.json');

        // Buscar al usuario
        const usuario = usuarios.find(u => u.id === id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Verificar si tiene ventas relacionadas
        const tieneVentas = ventas.some(
            venta => venta.id_usuario === id
        );

        // No permitir eliminar usuarios con ventas
        if (tieneVentas) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el usuario porque tiene ventas registradas'
            });
        }

        // Eliminar el usuario del arreglo
        const usuariosActualizados = usuarios.filter(
            u => u.id !== id
        );

        // Guardar los cambios
        await guardarJSON('./usuarios.json', usuariosActualizados);

        res.status(200).json({
            mensaje: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el usuario'
        });
    }

});

// --------------------------------------------
// INICIAR EL SERVIDOR
// --------------------------------------------

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});