
import express from 'express';
import { leerJSON, guardarJSON } from '../../data/archivos.mjs';

const router = express.Router();

const archivoUsuarios = '../data/usuarios.json';
const archivoVentas = '../data/ventas.json';

// POST - REGISTRAR UN NUEVO USUARIO
router.post('/', async (req, res) => {
    try {
        // Recibir los datos del usuario
        const { nombre, apellido, email, password } = req.body;

        // Validar los campos obligatorios
        if (
            typeof nombre !== 'string' || !nombre.trim() ||
            typeof apellido !== 'string' || !apellido.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Leer los usuarios existentes
        const usuarios = await leerJSON(archivoUsuarios);

        // Comprobar que el email no esté registrado
        const existeEmail = usuarios.some(
            usuario => usuario.email.toLowerCase() === email.toLowerCase()
        );

        if (existeEmail) {
            return res.status(400).json({
                mensaje: 'El email ya está registrado'
            });
        }

        // Generar un nuevo ID
        const nuevoId = Math.max(0, ...usuarios.map(u => u.id)) + 1;

        // Crear el usuario
        const nuevoUsuario = {
            id: nuevoId,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            password: password,
            activo: true
        };

        // Agregarlo al arreglo
        usuarios.push(nuevoUsuario);

        // Guardar los cambios en el JSON
        await guardarJSON(archivoUsuarios, usuarios);

        // Responder al cliente
        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            id: nuevoId
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar el usuario'
        });
    }
});

// DELETE - ELIMINAR UN USUARIO
router.delete('/:id', async (req, res) => {
    try {
        // Obtener el ID desde la URL
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID es incorrecto'
            });
        }

        // Leer usuarios y ventas
        const usuarios = await leerJSON(archivoUsuarios);
        const ventas = await leerJSON(archivoVentas);

        // Buscar al usuario
        const usuario = usuarios.find(u => u.id === id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Verificar si tiene ventas relacionadas
        const tieneVentas = ventas.some(
            venta => venta.id_usuario === id
        );

        // No permitir eliminar usuarios con ventas
        if (tieneVentas) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el usuario porque tiene ventas registradas'
            });
        }

        // Eliminar el usuario del arreglo
        const usuariosActualizados = usuarios.filter(
            u => u.id !== id
        );

        // Guardar los cambios
        await guardarJSON(archivoUsuarios, usuariosActualizados);

        res.status(200).json({
            mensaje: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el usuario'
        });
    }
});

export default router;
