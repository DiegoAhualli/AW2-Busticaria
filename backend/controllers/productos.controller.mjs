
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const archivoProductos = fileURLToPath(
    new URL('../../data/productos.json', import.meta.url)
);

// GET - Listar productos
export async function listarProductos(req, res) {
    try {
        const productos = await leerJSON(archivoProductos);
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar los productos'
        });
    }
}

// POST - Agregar un producto
export async function agregarProducto(req, res) {
    try {
        const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;

        const productos = await leerJSON(archivoProductos);
        const nuevoId = Math.max(0, ...productos.map(p => p.id)) + 1;

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

        productos.push(nuevoProducto);
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
}

// PUT - Actualizar stock
export async function actualizarStock(req, res) {
    try {
        const id = Number(req.params.id);
        const { stock } = req.body;

        const productos = await leerJSON(archivoProductos);
        const producto = productos.find(p => p.id === id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

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
}
