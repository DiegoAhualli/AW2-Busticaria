import { obtenerBaseDatos } from '../config/mongodb.mjs';
import { siguienteId } from '../services/contadores.mjs';

function idDesdeParametro(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function sinIdMongo(documento) {
    if (!documento) return documento;
    const { _id, ...publico } = documento;
    return publico;
}

// GET /api/productos
export async function listarProductos(req, res) {
    try {
        const productos = await obtenerBaseDatos()
            .collection('productos')
            .find({}, { projection: { _id: 0 } })
            .sort({ id: 1 })
            .toArray();

        return res.status(200).json(productos);
    } catch (error) {
        console.error('Error al consultar productos:', error.message);
        return res.status(500).json({ mensaje: 'Error al consultar los productos' });
    }
}

// GET /api/productos/:id
export async function obtenerProducto(req, res) {
    try {
        const id = idDesdeParametro(req.params.id);

        if (!id) {
            return res.status(400).json({ mensaje: 'El ID es incorrecto' });
        }

        const producto = await obtenerBaseDatos()
            .collection('productos')
            .findOne({ id }, { projection: { _id: 0 } });

        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        return res.status(200).json(producto);
    } catch (error) {
        console.error('Error al consultar producto:', error.message);
        return res.status(500).json({ mensaje: 'Error al consultar el producto' });
    }
}

// POST /api/productos
export async function agregarProducto(req, res) {
    try {
        const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;
        const nuevoProducto = {
            id: await siguienteId('productos'),
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria: categoria.trim().toLowerCase(),
            precio,
            stock,
            imagen: imagen.trim(),
            disponible: stock > 0
        };

        await obtenerBaseDatos().collection('productos').insertOne(nuevoProducto);

        return res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error('Error al registrar producto:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'El producto ya existe' });
        }

        return res.status(500).json({ mensaje: 'Error al registrar el producto' });
    }
}

// PUT /api/productos/:id
export async function actualizarStock(req, res) {
    try {
        const id = idDesdeParametro(req.params.id);
        const { stock } = req.body;

        const producto = await obtenerBaseDatos()
            .collection('productos')
            .findOneAndUpdate(
                { id },
                { $set: { stock, disponible: stock > 0 } },
                { returnDocument: 'after' }
            );

        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        return res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            producto: sinIdMongo(producto)
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
}

// DELETE /api/productos/:id
export async function eliminarProducto(req, res) {
    try {
        const id = idDesdeParametro(req.params.id);

        if (!id) {
            return res.status(400).json({ mensaje: 'El ID es incorrecto' });
        }

        const db = obtenerBaseDatos();
        const producto = await db.collection('productos').findOne({ id });

        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // Evita referencias inválidas en el historial de ventas.
        const tieneVentas = await db.collection('ventas').findOne(
            { 'productos.id_producto': id },
            { projection: { _id: 1 } }
        );

        if (tieneVentas) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el producto porque tiene ventas registradas'
            });
        }

        await db.collection('productos').deleteOne({ id });

        return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
}
