
import { fileURLToPath } from 'node:url';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const archivoVentas = fileURLToPath(
    new URL('../../data/ventas.json', import.meta.url)
);

const archivoProductos = fileURLToPath(
    new URL('../../data/productos.json', import.meta.url)
);

const archivoUsuarios = fileURLToPath(
    new URL('../../data/usuarios.json', import.meta.url)
);

// GET /api/ventas
export async function listarVentas(req, res) {
    try {
        const ventas = await leerJSON(archivoVentas);

        return res.status(200).json(ventas);

    } catch (error) {
        console.error('Error al consultar ventas:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar las ventas'
        });
    }
}

// Cola para procesar las compras de forma secuencial
let colaCompras = Promise.resolve();

// POST /api/ventas
export function crearVenta(req, res) {
    const proceso = colaCompras.then(
        () => registrarCompra(req, res)
    );

    colaCompras = proceso.catch(error => {
        console.error('Error en la cola de compras:', error);

        if (!res.headersSent) {
            res.status(500).json({
                mensaje: 'Error interno al registrar la compra'
            });
        }
    });
}

// Registrar compra y descontar stock
async function registrarCompra(req, res) {
    try {
        const {
            id_usuario,
            direccion,
            productos
        } = req.body ?? {};

        // Validar usuario, dirección y listado
        if (
            !Number.isInteger(id_usuario) ||
            id_usuario <= 0 ||
            typeof direccion !== 'string' ||
            direccion.trim().length < 5 ||
            direccion.trim().length > 200 ||
            !Array.isArray(productos) ||
            productos.length === 0
        ) {
            return res.status(400).json({
                mensaje: 'Usuario, dirección o productos incorrectos'
            });
        }

        // Validar productos y cantidades
        const ids = new Set();

        for (const item of productos) {
            if (
                !item ||
                !Number.isInteger(item.id_producto) ||
                item.id_producto <= 0 ||
                !Number.isInteger(item.cantidad) ||
                item.cantidad <= 0 ||
                ids.has(item.id_producto)
            ) {
                return res.status(400).json({
                    mensaje: 'Los productos o cantidades son incorrectos o están repetidos'
                });
            }

            ids.add(item.id_producto);
        }

        // Comprobar que el usuario exista y esté activo
        const usuarios = await leerJSON(archivoUsuarios);

        const usuario = usuarios.find(
            u => u.id === id_usuario
        );

        if (!usuario || usuario.activo !== true) {
            return res.status(403).json({
                mensaje: 'El usuario no existe o está inactivo'
            });
        }

        // Obtener productos y ventas actuales
        const catalogo = await leerJSON(archivoProductos);
        const ventas = await leerJSON(archivoVentas);

        const catalogoActualizado = structuredClone(catalogo);

        let total = 0;

        // Revisar productos y descontar stock
        for (const item of productos) {
            const producto = catalogoActualizado.find(
                p => p.id === item.id_producto
            );

            if (!producto) {
                return res.status(404).json({
                    mensaje: `No existe el producto ${item.id_producto}`
                });
            }

            if (
                producto.disponible !== true ||
                producto.stock < item.cantidad
            ) {
                return res.status(409).json({
                    mensaje: `Stock insuficiente de ${producto.nombre}`
                });
            }

            if (
                typeof producto.precio !== 'number' ||
                !Number.isFinite(producto.precio) ||
                producto.precio <= 0
            ) {
                return res.status(500).json({
                    mensaje: 'El precio del producto es inválido'
                });
            }

            // El precio se obtiene del servidor
            total += producto.precio * item.cantidad;

            producto.stock -= item.cantidad;
            producto.disponible = producto.stock > 0;
        }

        if (!Number.isFinite(total) || total <= 0) {
            return res.status(400).json({
                mensaje: 'El total de la compra es inválido'
            });
        }

        // Crear nueva venta
        const nuevaVenta = {
            id: Math.max(0, ...ventas.map(v => v.id)) + 1,
            id_usuario: id_usuario,
            fecha: new Date().toISOString().slice(0, 10),
            total: total,
            direccion: direccion.trim(),
            pagada: false,
            productos: productos.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }))
        };

        // Guardar stock actualizado
        await guardarJSON(
            archivoProductos,
            catalogoActualizado
        );

        // Registrar venta
        try {
            await guardarJSON(
                archivoVentas,
                [...ventas, nuevaVenta]
            );
        } catch (error) {
            // Intentar restaurar stock si falla la venta
            try {
                await guardarJSON(archivoProductos, catalogo);
            } catch (errorRestauracion) {
                console.error(
                    'No se pudo restaurar el stock:',
                    errorRestauracion
                );
            }

            throw error;
        }

        return res.status(201).json({
            mensaje: 'Orden de compra registrada correctamente',
            venta: nuevaVenta
        });

    } catch (error) {
        console.error('Error al registrar la compra:', error);

        return res.status(500).json({
            mensaje: 'Error interno al registrar la compra'
        });
    }
}
