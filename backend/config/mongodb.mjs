import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import { obtenerMongoUri } from './entorno.mjs';

const NOMBRE_BASE = 'busticaria';

let cliente;
let baseDatos;

export async function conectarMongoDB() {
    if (baseDatos) return baseDatos;

    const uri = obtenerMongoUri();
    const opciones = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000
    };

    cliente = new MongoClient(uri, opciones);

    try {
        await cliente.connect();
    } catch (error) {
        // Reintenta consultas SRV bloqueadas por el resolvedor DNS local.
        if (error.code !== 'ECONNREFUSED' || !uri.startsWith('mongodb+srv://')) {
            throw error;
        }

        await cliente.close();
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        cliente = new MongoClient(uri, opciones);
        await cliente.connect();
    }

    baseDatos = cliente.db(NOMBRE_BASE);
    await baseDatos.command({ ping: 1 });

    return baseDatos;
}

export function obtenerBaseDatos() {
    if (!baseDatos) {
        throw new Error('MongoDB todavía no está conectado');
    }

    return baseDatos;
}

export function obtenerClienteMongo() {
    if (!cliente) {
        throw new Error('MongoDB todavía no está conectado');
    }

    return cliente;
}

export async function crearIndices() {
    const db = obtenerBaseDatos();

    // Los índices únicos preservan los identificadores usados por la API REST.
    await Promise.all([
        db.collection('usuarios').createIndex(
            { id: 1 },
            { unique: true, name: 'usuarios_id_unico' }
        ),
        db.collection('usuarios').createIndex(
            { email: 1 },
            { unique: true, name: 'usuarios_email_unico' }
        ),
        db.collection('productos').createIndex(
            { id: 1 },
            { unique: true, name: 'productos_id_unico' }
        ),
        db.collection('ventas').createIndex(
            { id: 1 },
            { unique: true, name: 'ventas_id_unico' }
        ),
        db.collection('ventas').createIndex(
            { id_usuario: 1 },
            { name: 'ventas_por_usuario' }
        ),
        db.collection('ventas').createIndex(
            { 'productos.id_producto': 1 },
            { name: 'ventas_por_producto' }
        )
    ]);
}

export async function comprobarSoporteTransacciones() {
    // Las compras requieren un replica set o un clúster fragmentado.
    const respuesta = await obtenerBaseDatos().admin().command({ hello: 1 });
    return Boolean(respuesta.setName || respuesta.msg === 'isdbgrid');
}

export async function cerrarMongoDB() {
    if (!cliente) return;

    await cliente.close();
    cliente = undefined;
    baseDatos = undefined;
}
