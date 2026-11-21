import { obtenerBaseDatos } from '../config/mongodb.mjs';
import { siguienteId } from '../services/contadores.mjs';
import { generarHashBcrypt, verificarPassword } from '../utils/passwords.mjs';
import { generarToken } from '../utils/jwt.mjs';

function datosPublicos(usuario) {
    // La contraseña nunca forma parte de una respuesta HTTP.
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        activo: usuario.activo
    };
}

// POST /api/usuarios/login
export async function iniciarSesion(req, res) {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({ mensaje: 'Ingresá email y contraseña' });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const usuarios = obtenerBaseDatos().collection('usuarios');
        const usuario = await usuarios.findOne({ email: emailNormalizado });
        const resultado = usuario
            ? await verificarPassword(password, usuario.password)
            : { valida: false };

        if (!usuario || !resultado.valida) {
            return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
        }

        if (usuario.activo !== true) {
            return res.status(403).json({ mensaje: 'La cuenta se encuentra inactiva' });
        }

        if (resultado.requiereRehash) {
            // Actualiza credenciales históricas después de una validación correcta.
            const nuevoHash = await generarHashBcrypt(password);
            await usuarios.updateOne(
                { _id: usuario._id, password: usuario.password },
                { $set: { password: nuevoHash } }
            );
        }

        return res.status(200).json({
            mensaje: 'Inicio de sesión correcto',
            usuario: datosPublicos(usuario),
            token: generarToken(usuario)
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        return res.status(500).json({ mensaje: 'Error interno al iniciar sesión' });
    }
}

// POST /api/usuarios
export async function registrarUsuario(req, res) {
    try {
        const { nombre, apellido, email, password } = req.body ?? {};

        if (
            typeof nombre !== 'string' || !nombre.trim() ||
            typeof apellido !== 'string' || !apellido.trim() ||
            typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof password !== 'string' || password.length < 8
        ) {
            return res.status(400).json({
                mensaje: 'Ingresá nombre, apellido, email válido y contraseña de al menos 8 caracteres'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const usuarios = obtenerBaseDatos().collection('usuarios');

        if (await usuarios.findOne({ email: emailNormalizado }, { projection: { _id: 1 } })) {
            return res.status(409).json({ mensaje: 'El email ya está registrado' });
        }

        const nuevoUsuario = {
            id: await siguienteId('usuarios'),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNormalizado,
            password: await generarHashBcrypt(password),
            activo: true
        };

        await usuarios.insertOne(nuevoUsuario);

        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: datosPublicos(nuevoUsuario)
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({ mensaje: 'El email ya está registrado' });
        }

        return res.status(500).json({ mensaje: 'Error interno al registrar usuario' });
    }
}

// DELETE /api/usuarios/:id
export async function eliminarUsuario(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ mensaje: 'El ID es incorrecto' });
        }

        const db = obtenerBaseDatos();

        if (!await db.collection('usuarios').findOne({ id }, { projection: { _id: 1 } })) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Conserva la integridad referencial del historial de ventas.
        if (await db.collection('ventas').findOne(
            { id_usuario: id },
            { projection: { _id: 1 } }
        )) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el usuario porque tiene ventas registradas'
            });
        }

        await db.collection('usuarios').deleteOne({ id });
        return res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);
        return res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
}
