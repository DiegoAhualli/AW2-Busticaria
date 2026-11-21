import jwt from 'jsonwebtoken';
import { obtenerJwtSecret } from '../config/entorno.mjs';

export const EXPIRACION_JWT = '2h';

export function generarToken(usuario) {
    return jwt.sign(
        { sub: String(usuario.id) },
        obtenerJwtSecret(),
        {
            algorithm: 'HS256',
            expiresIn: EXPIRACION_JWT,
            issuer: 'busticaria-api',
            audience: 'busticaria-frontend'
        }
    );
}

export function verificarToken(token) {
    return jwt.verify(token, obtenerJwtSecret(), {
        algorithms: ['HS256'],
        issuer: 'busticaria-api',
        audience: 'busticaria-frontend'
    });
}
