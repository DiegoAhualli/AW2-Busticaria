
import express from 'express';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();
const archivoVentas = '../data/ventas.json';

// GET - CONSULTAR TODAS LAS VENTAS
router.get('/', async (req, res) => {
    try {
        const ventas = await leerJSON(archivoVentas);

        res.status(200).json(ventas);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar las ventas'
        });
    }
});

export default router;
