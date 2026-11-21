import { obtenerBaseDatos } from '../config/mongodb.mjs';

export async function siguienteId(recurso, opciones = {}) {
    const contador = await obtenerBaseDatos()
        .collection('contadores')
        .findOneAndUpdate(
            { _id: recurso },
            { $inc: { valor: 1 } },
            {
                upsert: true,
                returnDocument: 'after',
                session: opciones.session
            }
        );

    return contador.valor;
}

export async function inicializarContador(recurso, valor) {
    await obtenerBaseDatos().collection('contadores').updateOne(
        { _id: recurso },
        { $max: { valor } },
        { upsert: true }
    );
}
