/**
 * Servidor principal de Busticaria (AW2).
 * Desde acá levantamos Express, conectamos las rutas de la API
 * y servimos las páginas del frontend.
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cada recurso tiene sus rutas separadas para mantener el proyecto ordenado.
import productosRouter from './routes/productos.mjs';
import usuariosRouter from './routes/usuarios.mjs';
import ventasRouter from './routes/ventas.mjs';

const app = express();
const PORT = 3000;

// Calculamos dónde está el frontend tomando como referencia este archivo.
// Así no necesitamos escribir una ruta fija de nuestra computadora.
const directorioBackend = path.dirname(fileURLToPath(import.meta.url));
const directorioFrontend = path.resolve(directorioBackend, '../frontend');

// Permite recibir datos JSON enviados desde fetch o Postman.
app.use(express.json());

// Rutas que exponen los recursos del sistema.
// Express deriva cada solicitud al archivo que le corresponde.
app.use('/api/productos', productosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ventas', ventasRouter);

// Cuando entramos a la raíz, abrimos directamente la página principal.
app.get('/', (req, res) => {
    res.redirect('/pages/home.html');
});

// Express también entrega HTML, CSS, imágenes y JS del frontend.
// Como la página y la API usan el mismo origen, no necesitamos configurar CORS.
app.use(express.static(directorioFrontend));

// Si una solicitud no coincide con ninguna ruta anterior, devolvemos 404.
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Iniciamos el servidor y mostramos las URLs principales en consola.
app.listen(PORT, () => {
    console.log(`Busticaria: http://localhost:${PORT}/pages/home.html`);
    console.log(`API productos: http://localhost:${PORT}/api/productos`);
});
