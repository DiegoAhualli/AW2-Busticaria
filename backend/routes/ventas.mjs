import express from 'express';
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();

// Rutas absolutas: funcionan independientemente de la carpeta donde iniciamos Node.
const archivoVentas = fileURLToPath(new URL('../../data/ventas.json', import.meta.url));
const archivoProductos = fileURLToPath(new URL('../../data/productos.json', import.meta.url));
const archivoUsuarios = fileURLToPath(new URL('../../data/usuarios.json', import.meta.url));

// GET - CONSULTAR TODAS LAS VENTAS (TP2)
router.get('/', async (req, res) => {
    try {
        const ventas = await leerJSON(archivoVentas);
        return res.status(200).json(ventas);
    } catch (error) {
        console.error('Error al consultar ventas:', error);
        return res.status(500).json({ mensaje: 'Error al consultar las ventas' });
    }
});

// Evitar que dos compras simultáneas lean el mismo stock antes de descontarlo.
let colaCompras = Promise.resolve();

// POST - REGISTRAR UNA NUEVA ORDEN DE COMPRA (TP3)
router.post('/', (req, res) => {
    const proceso = colaCompras.then(() => registrarCompra(req, res));
    colaCompras = proceso.catch(() => {});
});

async function registrarCompra(req, res) {
    try {
        const { id_usuario, direccion, productos } = req.body ?? {};

        // Validar los datos de entrada. El precio nunca se acepta desde el cliente.
        if (!Number.isInteger(id_usuario) || id_usuario <= 0 ||
            typeof direccion !== 'string' || direccion.trim().length < 5 ||
            direccion.trim().length > 200 ||
            !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ mensaje: 'Usuario, dirección o productos incorrectos' });
        }

        const ids = new Set();
        for (const item of productos) {
            if (!item || !Number.isInteger(item.id_producto) || item.id_producto <= 0 ||
                !Number.isInteger(item.cantidad) || item.cantidad <= 0 ||
                ids.has(item.id_producto)) {
                return res.status(400).json({ mensaje: 'Los productos o cantidades son incorrectos o están repetidos' });
            }
            ids.add(item.id_producto);
        }

        const usuarios = await leerJSON(archivoUsuarios);
        const usuario = usuarios.find(u => u.id === id_usuario);
        if (!usuario || usuario.activo !== true) {
            return res.status(403).json({ mensaje: 'El usuario no existe o está inactivo' });
        }

        const catalogo = await leerJSON(archivoProductos);
        const ventas = await leerJSON(archivoVentas);
        let total = 0;

        // Trabajar sobre una copia hasta terminar todas las verificaciones.
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

            total += producto.precio * item.cantidad;
            producto.stock -= item.cantidad;
            producto.disponible = producto.stock > 0;
        }

        if (!Number.isFinite(total) || total <= 0) {
            return res.status(400).json({ mensaje: 'El total de la compra es inválido' });
        }

        const nuevaVenta = {
            id: Math.max(0, ...ventas.map(v => v.id)) + 1,
            id_usuario,
            fecha: new Date().toISOString().slice(0, 10),
            total,
            direccion: direccion.trim(),
            pagada: false, // Se registra la orden; el pago no se procesa en este TP.
            productos: productos.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }))
        };

        // Primero actualizamos el stock; si falla guardar la venta,
        // intentamos restaurar el catálogo original.
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
