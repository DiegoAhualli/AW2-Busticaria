import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    cerrarMongoDB,
    comprobarSoporteTransacciones,
    conectarMongoDB,
    crearIndices
} from './config/mongodb.mjs';
import { obtenerJwtSecret, obtenerPuerto } from './config/entorno.mjs';

import productosRouter from './routes/productos.mjs';
import usuariosRouter from './routes/usuarios.mjs';
import ventasRouter from './routes/ventas.mjs';

const app = express();

// La ruta se resuelve desde este módulo para evitar dependencias del directorio de ejecución.
const directorioBackend = path.dirname(fileURLToPath(import.meta.url));
const directorioFrontend = path.resolve(directorioBackend, '../frontend');

app.use(express.json({ limit: '100kb' }));

app.use('/api/productos', productosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ventas', ventasRouter);

app.get('/', (req, res) => {
    res.redirect('/pages/home.html');
});

// El frontend y la API comparten origen; no se requiere configuración CORS.
app.use(express.static(directorioFrontend));

app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

let servidor;

async function iniciarServidor() {
    try {
        // La configuración se valida antes de aceptar solicitudes.
        obtenerJwtSecret();
        const puerto = obtenerPuerto();

        await conectarMongoDB();
        await crearIndices();

        // Sin transacciones no puede garantizarse la consistencia entre venta y stock.
        const admiteTransacciones = await comprobarSoporteTransacciones();

        if (!admiteTransacciones) {
            throw new Error(
                'La instancia de MongoDB no admite las transacciones requeridas para las compras'
            );
        }

        servidor = app.listen(puerto, () => {
            console.log(`Busticaria: http://localhost:${puerto}/pages/home.html`);
            console.log(`API productos: http://localhost:${puerto}/api/productos`);
            console.log('MongoDB conectado a la base busticaria');
        });
    } catch (error) {
        console.error(`No se pudo iniciar Busticaria: ${error.message}`);
        await cerrarMongoDB();
        process.exitCode = 1;
    }
}

async function cerrarServidor(senal) {
    console.log(`Cerrando Busticaria (${senal})...`);

    if (servidor) {
        await new Promise(resolve => servidor.close(resolve));
    }

    await cerrarMongoDB();
    process.exit(0);
}

process.once('SIGINT', () => cerrarServidor('SIGINT'));
process.once('SIGTERM', () => cerrarServidor('SIGTERM'));

await iniciarServidor();
