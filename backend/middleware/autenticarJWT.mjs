import { verificarToken } from '../utils/jwt.mjs';

export function autenticarJWT(req, res, next) {
    const autorizacion = req.get('Authorization');

    if (!autorizacion) {
        return res.status(401).json({
            mensaje: 'Se requiere un token de autenticación'
        });
    }

    const coincidencia = /^Bearer\s+(.+)$/i.exec(autorizacion.trim());

    if (!coincidencia) {
        return res.status(401).json({
            mensaje: 'El encabezado Authorization es inválido'
        });
    }

    try {
        const payload = verificarToken(coincidencia[1]);
        const idUsuario = Number(payload.sub);

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            throw new Error('Identidad de token inválida');
        }

        req.autenticacion = { idUsuario };
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: error.name === 'TokenExpiredError'
                ? 'El token de autenticación venció'
                : 'El token de autenticación es inválido'
        });
    }
}
