
import express from 'express';

import {
    listarVentas,
    crearVenta
} from '../controllers/ventas.controller.mjs';

const router = express.Router();

// Consultar las ventas registradas
router.get('/', listarVentas);

// Registrar una orden de compra
router.post('/', crearVenta);

export default router;
