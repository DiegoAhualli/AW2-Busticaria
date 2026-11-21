import { obtenerBaseDatos, obtenerClienteMongo } from '../config/mongodb.mjs';
import { siguienteId } from '../services/contadores.mjs';
import { ErrorHTTP } from '../utils/ErrorHTTP.mjs';

function fechaArgentina() {
    // La fecha comercial se registra en la zona horaria definida para el proyecto.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
}

export async function listarVentas(req, res) {
    try {
        const ventas = await obtenerBaseDatos()
            .collection('ventas')
            .find({}, { projection: { _id: 0 } })
            .sort({ id: 1 })
            .toArray();

        return res.status(200).json(ventas);
    } catch (error) {
        console.error('Error al consultar ventas:', error.message);
        return res.status(500).json({ mensaje: 'Error al consultar las ventas' });
    }
}

// Rechaza productos duplicados para que cada descuento de stock sea inequívoco.
function validarSolicitud(direccion, productos) {
    if (
        typeof direccion !== 'string' ||
        direccion.trim().length < 5 ||
        direccion.trim().length > 200 ||
        !Array.isArray(productos) ||
        productos.length === 0
    ) {
        throw new ErrorHTTP(400, 'La dirección o los productos son incorrectos');
    }

    const ids = new Set();

    for (const item of productos) {
        if (
            !item ||
            !Number.isInteger(item.id_producto) || item.id_producto <= 0 ||
            !Number.isInteger(item.cantidad) || item.cantidad <= 0 ||
            ids.has(item.id_producto)
        ) {
            throw new ErrorHTTP(
                400,
                'Los productos o cantidades son incorrectos o están repetidos'
            );
        }

        ids.add(item.id_producto);
    }
}

// POST /api/ventas
export async function crearVenta(req, res) {
    // La identidad autorizada proviene del JWT, no del cuerpo de la solicitud.
    const idUsuario = req.autenticacion.idUsuario;
    const { id_usuario: idEnviado, direccion, productos } = req.body ?? {};

    try {
        validarSolicitud(direccion, productos);

        if (idEnviado !== undefined && Number(idEnviado) !== idUsuario) {
            throw new ErrorHTTP(403, 'No podés registrar una compra para otro usuario');
        }

        const db = obtenerBaseDatos();
        const sesion = obtenerClienteMongo().startSession();
        let nuevaVenta;

        try {
            // El descuento de stock y el alta de la venta forman una sola operación atómica.
            await sesion.withTransaction(async () => {
                const usuario = await db.collection('usuarios').findOne(
                    { id: idUsuario, activo: true },
                    { session: sesion, projection: { _id: 1 } }
                );

                if (!usuario) {
                    throw new ErrorHTTP(403, 'El usuario no existe o está inactivo');
                }

                let total = 0;

                for (const item of productos) {
                    // El filtro de stock dentro de la actualización impide sobreventas concurrentes.
                    const producto = await db.collection('productos').findOneAndUpdate(
                        {
                            id: item.id_producto,
                            disponible: true,
                            stock: { $gte: item.cantidad },
                            precio: { $type: 'number', $gt: 0 }
                        },
                        [
                            { $set: { stock: { $subtract: ['$stock', item.cantidad] } } },
                            { $set: { disponible: { $gt: ['$stock', 0] } } }
                        ],
                        { session: sesion, returnDocument: 'after' }
                    );

                    if (!producto) {
                        const existente = await db.collection('productos').findOne(
                            { id: item.id_producto },
                            { session: sesion, projection: { _id: 0 } }
                        );

                        if (!existente) {
                            throw new ErrorHTTP(
                                404,
                                `No existe el producto ${item.id_producto}`
                            );
                        }

                        if (
                            typeof existente.precio !== 'number' ||
                            !Number.isFinite(existente.precio) ||
                            existente.precio <= 0
                        ) {
                            throw new ErrorHTTP(500, 'El precio del producto es inválido');
                        }

                        throw new ErrorHTTP(
                            409,
                            `Stock insuficiente de ${existente.nombre}`
                        );
                    }

                    // El total se calcula con el precio persistido, sin confiar en el cliente.
                    total += producto.precio * item.cantidad;
                }

                if (!Number.isFinite(total) || total <= 0) {
                    throw new ErrorHTTP(400, 'El total de la compra es inválido');
                }

                nuevaVenta = {
                    id: await siguienteId('ventas', { session: sesion }),
                    id_usuario: idUsuario,
                    fecha: fechaArgentina(),
                    total,
                    direccion: direccion.trim(),
                    pagada: false,
                    productos: productos.map(item => ({
                        id_producto: item.id_producto,
                        cantidad: item.cantidad
                    }))
                };

                await db.collection('ventas').insertOne(nuevaVenta, { session: sesion });
            }, {
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority' },
                maxCommitTimeMS: 10000
            });
        } finally {
            await sesion.endSession();
        }

        return res.status(201).json({
            mensaje: 'Orden de compra registrada correctamente',
            venta: nuevaVenta
        });
    } catch (error) {
        if (error instanceof ErrorHTTP) {
            return res.status(error.estado).json({ mensaje: error.message });
        }

        console.error('Error al registrar compra:', error.message);

        if (
            error.code === 20 ||
            error.codeName === 'IllegalOperation' ||
            /Transaction numbers are only allowed/i.test(error.message)
        ) {
            return res.status(503).json({
                mensaje: 'La base de datos no permite garantizar una compra atómica'
            });
        }

        return res.status(500).json({ mensaje: 'Error interno al registrar la compra' });
    }
}
