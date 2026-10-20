/**
 * Rutas de ventas de Busticaria.
 * GET consulta el historial. POST registra una orden de compra,
 * revisa el stock y actualiza los archivos JSON.
 */
import express from 'express';
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();

// Usamos rutas absolutas para encontrar los tres archivos de datos.
const archivoVentas = fileURLToPath(new URL('../../data/ventas.json', import.meta.url));
const archivoProductos = fileURLToPath(new URL('../../data/productos.json', import.meta.url));
const archivoUsuarios = fileURLToPath(new URL('../../data/usuarios.json', import.meta.url));

// GET /api/ventas: permite consultar las ventas registradas.
router.get('/', async (req, res) => {
    try {
        const ventas = await leerJSON(archivoVentas);
        return res.status(200).json(ventas);
    } catch (error) {
        console.error('Error al consultar ventas:', error);
        return res.status(500).json({ mensaje: 'Error al consultar las ventas' });
    }
});

// Procesamos una compra por vez para no descontar dos veces el mismo stock
// si llegan dos solicitudes simultáneas a este servidor Node.
let colaCompras = Promise.resolve();

// POST /api/ventas: agrega una orden con productos y usuario.
router.post('/', (req, res) => {
    const proceso = colaCompras.then(() => registrarCompra(req, res));
    colaCompras = proceso.catch(() => {});
});

async function registrarCompra(req, res) {
    try {
        const { id_usuario, direccion, productos } = req.body ?? {};

        // Revisamos los datos recibidos. La compra necesita un usuario,
        // una dirección y al menos un producto con cantidad válida.
        // El cliente no manda el total: lo calculamos desde el catálogo.
        if (!Number.isInteger(id_usuario) || id_usuario <= 0 ||
            typeof direccion !== 'string' || direccion.trim().length < 5 ||
            direccion.trim().length > 200 ||
            !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ mensaje: 'Usuario, dirección o productos incorrectos' });
        }

        // No admitimos IDs repetidos en una misma orden ni cantidades incorrectas.
        const ids = new Set();
        for (const item of productos) {
            if (!item || !Number.isInteger(item.id_producto) || item.id_producto <= 0 ||
                !Number.isInteger(item.cantidad) || item.cantidad <= 0 ||
                ids.has(item.id_producto)) {
                return res.status(400).json({ mensaje: 'Los productos o cantidades son incorrectos o están repetidos' });
            }
            ids.add(item.id_producto);
        }

        // Comprobamos que el usuario exista y tenga su cuenta activa.
        const usuarios = await leerJSON(archivoUsuarios);
        const usuario = usuarios.find(u => u.id === id_usuario);
        if (!usuario || usuario.activo !== true) {
            return res.status(403).json({ mensaje: 'El usuario no existe o está inactivo' });
        }

        // Cargamos productos y ventas antes de construir la nueva orden.
        const catalogo = await leerJSON(archivoProductos);
        const ventas = await leerJSON(archivoVentas);
        let total = 0;

        // Trabajamos sobre una copia para no alterar el catálogo original
        // mientras todavía estamos validando los productos de la compra.
        const catalogoActualizado = structuredClone(catalogo);
        for (const item of productos) {
            const producto = catalogoActualizado.find(p => p.id === item.id_producto);

            if (!producto) {
                return res.status(404).json({ mensaje: `No existe el producto ${item.id_producto}` });
            }
            if (producto.disponible !== true || producto.stock < item.cantidad) {
                return res.status(409).json({ mensaje: `Stock insuficiente de ${producto.nombre}` });
            }
            if (typeof producto.precio !== 'number' || !Number.isFinite(producto.precio) || producto.precio <= 0) {
                return res.status(500).json({ mensaje: 'El precio del producto es inválido' });
            }

            // Usamos los precios del servidor, calculamos el total y restamos stock.
            total += producto.precio * item.cantidad;
            producto.stock -= item.cantidad;
            producto.disponible = producto.stock > 0;
        }

        if (!Number.isFinite(total) || total <= 0) {
            return res.status(400).json({ mensaje: 'El total de la compra es inválido' });
        }

        // Se mantiene el formato de ventas.json usado desde la primera entrega.
        const nuevaVenta = {
            id: Math.max(0, ...ventas.map(v => v.id)) + 1,
            id_usuario,
            fecha: new Date().toISOString().slice(0, 10),
            total,
            direccion: direccion.trim(),
            pagada: false, // Por ahora sólo registramos la orden, no cobramos online.
            productos: productos.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }))
        };

        // Guardamos los stocks actualizados y después la venta.
        // Si falla el segundo guardado, intentamos volver al stock anterior.
        // Con archivos JSON no tenemos transacciones como en una base de datos.
        await guardarJSON(archivoProductos, catalogoActualizado);
        try {
            await guardarJSON(archivoVentas, [...ventas, nuevaVenta]);
        } catch (error) {
            try {
                await guardarJSON(archivoProductos, catalogo);
            } catch (errorRestauracion) {
                console.error('No se pudo restaurar el stock:', errorRestauracion);
            }
            throw error;
        }

        // Avisamos al frontend que la orden quedó registrada.
        return res.status(201).json({
            mensaje: 'Orden de compra registrada correctamente',
            venta: nuevaVenta
        });
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        return res.status(500).json({ mensaje: 'Error interno al registrar la compra' });
    }
}

export default router;
