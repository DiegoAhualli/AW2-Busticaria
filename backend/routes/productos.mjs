
import express from 'express';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();
const archivoProductos = '../data/productos.json';

// GET - CONSULTAR TODOS LOS PRODUCTOS
router.get('/', async (req, res) => {
    try {
        const productos = await leerJSON(archivoProductos);

        res.status(200).json(productos);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar los productos'
        });
    }
});

// POST - REGISTRAR UN NUEVO PRODUCTO
router.post('/', async (req, res) => {
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
        const productos = await leerJSON(archivoProductos);

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
        await guardarJSON(archivoProductos, productos);

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

// PUT - ACTUALIZAR EL STOCK DE UN PRODUCTO
router.put('/:id', async (req, res) => {
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
        const productos = await leerJSON(archivoProductos);

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
        await guardarJSON(archivoProductos, productos);

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

export default router;
