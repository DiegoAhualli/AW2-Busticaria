/**
 * Rutas de productos de Busticaria.
 * GET: mostrar catálogo. POST: agregar productos. PUT: actualizar stock.
 * Los datos se guardan en productos.json por medio de archivos.mjs.
 */
import express from 'express';
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();

// Ubicamos el JSON desde este archivo, sin depender de dónde ejecutemos Node.
const archivoProductos = fileURLToPath(new URL('../../data/productos.json', import.meta.url));

// GET /api/productos: devuelve la lista completa para Home y categorías.
router.get('/', async (req, res) => {
    try {
        const productos = await leerJSON(archivoProductos);
        res.status(200).json(productos);
    } catch (error) {
        // No enviamos detalles internos del error al navegador.
        res.status(500).json({
            mensaje: 'Error al consultar los productos'
        });
    }
});

// POST /api/productos: permite incorporar un producto al catálogo.
router.post('/', async (req, res) => {
    try {
        // Tomamos sólo los campos esperados del cuerpo de la solicitud.
        const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;

        // Validamos tipos y valores antes de guardar información en el JSON.
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

        // Leemos los productos actuales para no perder los registros anteriores.
        const productos = await leerJSON(archivoProductos);

        // El ID nuevo se calcula a partir del mayor ID registrado.
        const nuevoId = Math.max(0, ...productos.map(p => p.id)) + 1;

        // Disponible depende del stock: si es cero, no se ofrece a la venta.
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

        // Agregamos el producto y persistimos la lista actualizada.
        productos.push(nuevoProducto);
        await guardarJSON(archivoProductos, productos);

        // 201 indica que se creó un recurso nuevo.
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

// PUT /api/productos/:id: modifica el stock de un producto existente.
router.put('/:id', async (req, res) => {
    try {
        // El ID llega como texto en la URL, por eso lo convertimos a número.
        const id = Number(req.params.id);
        const { stock } = req.body;

        // No aceptamos IDs inválidos ni stocks negativos o decimales.
        if (!Number.isInteger(id) || id <= 0 ||
            !Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                mensaje: 'El ID o el stock son incorrectos'
            });
        }

        const productos = await leerJSON(archivoProductos);
        const producto = productos.find(p => p.id === id);

        // Si no hay coincidencia, informamos que el producto no existe.
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        // Actualizamos stock y disponibilidad juntos para mantenerlos coherentes.
        producto.stock = stock;
        producto.disponible = stock > 0;
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
