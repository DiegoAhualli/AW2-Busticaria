
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import productosRouter from './routes/productos.mjs';
import usuariosRouter from './routes/usuarios.mjs';
import ventasRouter from './routes/ventas.mjs';

const app = express();
const PORT = 3000;

// Directorio donde está el frontend de Busticaria
const directorioBackend = path.dirname(fileURLToPath(import.meta.url));
const directorioFrontend = path.resolve(directorioBackend, '../frontend');

// Recibir JSON en las solicitudes POST y PUT
app.use(express.json());

// Rutas de la API (TP2)
app.use('/api/productos', productosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ventas', ventasRouter);

// Servir el frontend desde Express: mismo origen, sin problemas de CORS
app.get('/', (req, res) => {
    res.redirect('/pages/home.html');
});
app.use(express.static(directorioFrontend));

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Busticaria: http://localhost:${PORT}/pages/home.html`);
    console.log(`API productos: http://localhost:${PORT}/api/productos`);
});
