
import express from 'express';

import {
    iniciarSesion,
    registrarUsuario,
    eliminarUsuario
} from '../controllers/usuarios.controller.mjs';

const router = express.Router();

// POST - Iniciar sesión
router.post('/login', iniciarSesion);

// POST - Registrar un usuario nuevo
router.post('/', registrarUsuario);

// DELETE - Eliminar un usuario existente
router.delete('/:id', eliminarUsuario);

export default router;
