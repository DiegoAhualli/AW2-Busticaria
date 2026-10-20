
import express from 'express';

import productosRoutes from './routes/productos.mjs';
import usuariosRoutes from './routes/usuarios.mjs';
import ventasRoutes from './routes/ventas.mjs';

// Crear el servidor
const app = express();
const PORT = 3000;

// Permitir recibir datos JSON
app.use(express.json());

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: '¡Bienvenido a la API de Busticaria!'
    });
});

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ventas', ventasRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
