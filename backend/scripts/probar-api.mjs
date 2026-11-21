import jwt from 'jsonwebtoken';
import {
    cerrarMongoDB,
    conectarMongoDB,
    obtenerBaseDatos
} from '../config/mongodb.mjs';
import { obtenerJwtSecret } from '../config/entorno.mjs';

const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const marca = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const passwordPrueba = 'ClavePrueba2026!';
const emailUsuario = `api-${marca}@busticaria.test`;
const emailInactivo = `inactivo-${marca}@busticaria.test`;
const nombreProducto = `Producto prueba API ${marca}`;
const nombreProductoCompra = `Producto compra API ${marca}`;

const resultados = [];

function registrarResultado(nombre, correcto, detalle = '') {
    resultados.push({ nombre, correcto, detalle });
    console.log(`${correcto ? 'OK' : 'ERROR'} - ${nombre}${detalle ? ` (${detalle})` : ''}`);
}

async function solicitar(ruta, opciones = {}) {
    const respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
    const texto = await respuesta.text();
    let datos;

    try {
        datos = texto ? JSON.parse(texto) : null;
    } catch {
        datos = texto;
    }

    return { estado: respuesta.status, datos };
}

async function esperarEstado(nombre, estadoEsperado, promesa) {
    const respuesta = await promesa;
    const correcto = respuesta.estado === estadoEsperado;
    registrarResultado(nombre, correcto, `HTTP ${respuesta.estado}`);

    if (!correcto) {
        throw new Error(`${nombre}: se esperaba HTTP ${estadoEsperado}`);
    }

    return respuesta.datos;
}

function json(body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    return { headers, body: JSON.stringify(body) };
}

async function ejecutar() {
    await conectarMongoDB();
    const db = obtenerBaseDatos();

    const productosIniciales = await esperarEstado(
        'GET listado de productos',
        200,
        solicitar('/api/productos')
    );
    registrarResultado('Listado de productos es un arreglo', Array.isArray(productosIniciales));

    const ventasIniciales = await esperarEstado(
        'GET listado de ventas',
        200,
        solicitar('/api/ventas')
    );
    registrarResultado('Listado de ventas es un arreglo', Array.isArray(ventasIniciales));

    const productoCrud = await esperarEstado(
        'POST crear producto',
        201,
        solicitar('/api/productos', {
            method: 'POST',
            ...json({
                nombre: nombreProducto,
                descripcion: 'Producto controlado para probar el CRUD',
                categoria: 'tecnologia',
                precio: 1500,
                stock: 4,
                imagen: 'logo.webp'
            })
        })
    );
    await esperarEstado(
        'GET producto por ID',
        200,
        solicitar(`/api/productos/${productoCrud.producto.id}`)
    );

    const productoActualizado = await esperarEstado(
        'PUT actualizar stock',
        200,
        solicitar(`/api/productos/${productoCrud.producto.id}`, {
            method: 'PUT',
            ...json({ stock: 6 })
        })
    );
    registrarResultado(
        'PUT persistió stock y disponibilidad',
        productoActualizado.producto.stock === 6 && productoActualizado.producto.disponible === true
    );

    await esperarEstado(
        'DELETE producto sin ventas',
        200,
        solicitar(`/api/productos/${productoCrud.producto.id}`, { method: 'DELETE' })
    );
    await esperarEstado(
        'GET producto eliminado',
        404,
        solicitar(`/api/productos/${productoCrud.producto.id}`)
    );

    const registro = await esperarEstado(
        'POST registrar usuario',
        201,
        solicitar('/api/usuarios', {
            method: 'POST',
            ...json({
                nombre: 'Usuario',
                apellido: 'Prueba API',
                email: emailUsuario,
                password: passwordPrueba
            })
        })
    );
    registrarResultado(
        'Registro no expone password',
        !Object.hasOwn(registro.usuario, 'password')
    );

    const usuarioMongo = await db.collection('usuarios').findOne({ id: registro.usuario.id });
    registrarResultado(
        'Contraseña nueva almacenada con Bcrypt',
        typeof usuarioMongo?.password === 'string' && /^\$2[aby]\$/.test(usuarioMongo.password)
    );

    await esperarEstado(
        'Registro con email duplicado',
        409,
        solicitar('/api/usuarios', {
            method: 'POST',
            ...json({
                nombre: 'Usuario',
                apellido: 'Duplicado',
                email: emailUsuario,
                password: passwordPrueba
            })
        })
    );

    await esperarEstado(
        'Login con contraseña incorrecta',
        401,
        solicitar('/api/usuarios/login', {
            method: 'POST',
            ...json({ email: emailUsuario, password: 'Incorrecta2026!' })
        })
    );

    const login = await esperarEstado(
        'Login correcto y emisión JWT',
        200,
        solicitar('/api/usuarios/login', {
            method: 'POST',
            ...json({ email: emailUsuario, password: passwordPrueba })
        })
    );
    const token = login.token;
    registrarResultado(
        'Login no expone password',
        typeof token === 'string' && !JSON.stringify(login).includes('password')
    );

    const registroInactivo = await esperarEstado(
        'Registrar usuario para prueba inactiva',
        201,
        solicitar('/api/usuarios', {
            method: 'POST',
            ...json({
                nombre: 'Cuenta',
                apellido: 'Inactiva',
                email: emailInactivo,
                password: passwordPrueba
            })
        })
    );
    await db.collection('usuarios').updateOne(
        { id: registroInactivo.usuario.id },
        { $set: { activo: false } }
    );
    await esperarEstado(
        'Login de usuario inactivo',
        403,
        solicitar('/api/usuarios/login', {
            method: 'POST',
            ...json({ email: emailInactivo, password: passwordPrueba })
        })
    );
    await esperarEstado(
        'DELETE usuario sin ventas',
        200,
        solicitar(`/api/usuarios/${registroInactivo.usuario.id}`, { method: 'DELETE' })
    );

    const productoCompra = await esperarEstado(
        'Crear producto para compras',
        201,
        solicitar('/api/productos', {
            method: 'POST',
            ...json({
                nombre: nombreProductoCompra,
                descripcion: 'Producto controlado para probar compras',
                categoria: 'hogar',
                precio: 1250,
                stock: 2,
                imagen: 'logo.webp'
            })
        })
    );
    const cuerpoCompra = {
        direccion: 'Calle de Prueba 123',
        productos: [{ id_producto: productoCompra.producto.id, cantidad: 1 }]
    };

    await esperarEstado(
        'Compra sin token',
        401,
        solicitar('/api/ventas', { method: 'POST', ...json(cuerpoCompra) })
    );
    await esperarEstado(
        'Compra con token inválido',
        401,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json(cuerpoCompra, 'token.invalido.firma')
        })
    );

    const tokenVencido = jwt.sign(
        { sub: String(registro.usuario.id) },
        obtenerJwtSecret(),
        {
            algorithm: 'HS256',
            expiresIn: -1,
            issuer: 'busticaria-api',
            audience: 'busticaria-frontend'
        }
    );
    await esperarEstado(
        'Compra con token vencido',
        401,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json(cuerpoCompra, tokenVencido)
        })
    );

    await esperarEstado(
        'JWT impide comprar para otro usuario',
        403,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json({ ...cuerpoCompra, id_usuario: registro.usuario.id + 999 }, token)
        })
    );

    await esperarEstado(
        'Compra con producto inexistente',
        404,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json({
                direccion: cuerpoCompra.direccion,
                productos: [{ id_producto: 2147483647, cantidad: 1 }]
            }, token)
        })
    );

    await esperarEstado(
        'Compra con stock insuficiente',
        409,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json({
                direccion: cuerpoCompra.direccion,
                productos: [{ id_producto: productoCompra.producto.id, cantidad: 3 }]
            }, token)
        })
    );

    const compra = await esperarEstado(
        'Compra autenticada',
        201,
        solicitar('/api/ventas', {
            method: 'POST',
            ...json(cuerpoCompra, token)
        })
    );
    registrarResultado(
        'Venta usa identidad JWT y precio del servidor',
        compra.venta.id_usuario === registro.usuario.id && compra.venta.total === 1250
    );

    const productoDespues = await esperarEstado(
        'Consultar stock después de compra',
        200,
        solicitar(`/api/productos/${productoCompra.producto.id}`)
    );
    registrarResultado(
        'Compra descontó exactamente una unidad',
        productoDespues.stock === 1 && productoDespues.disponible === true
    );

    const comprasSimultaneas = await Promise.all([
        solicitar('/api/ventas', {
            method: 'POST',
            ...json(cuerpoCompra, token)
        }),
        solicitar('/api/ventas', {
            method: 'POST',
            ...json(cuerpoCompra, token)
        })
    ]);
    const estadosSimultaneos = comprasSimultaneas
        .map(respuesta => respuesta.estado)
        .sort((a, b) => a - b);
    registrarResultado(
        'Dos compras simultáneas no sobrevenden la última unidad',
        estadosSimultaneos[0] === 201 && estadosSimultaneos[1] === 409,
        `HTTP ${estadosSimultaneos.join(' y ')}`
    );

    const productoAgotado = await solicitar(
        `/api/productos/${productoCompra.producto.id}`
    );
    registrarResultado(
        'Concurrencia deja stock cero y producto no disponible',
        productoAgotado.estado === 200 &&
        productoAgotado.datos.stock === 0 &&
        productoAgotado.datos.disponible === false
    );

    const ventasDelProducto = await db.collection('ventas').countDocuments({
        id_usuario: registro.usuario.id,
        'productos.id_producto': productoCompra.producto.id
    });
    registrarResultado(
        'Solo se registraron las dos ventas posibles',
        ventasDelProducto === 2
    );

    await esperarEstado(
        'DELETE protege producto con ventas',
        409,
        solicitar(`/api/productos/${productoCompra.producto.id}`, { method: 'DELETE' })
    );

    const ventaPersistida = await db.collection('ventas').findOne({ id: compra.venta.id });
    registrarResultado(
        'Venta persistida en MongoDB',
        ventaPersistida?.id_usuario === registro.usuario.id
    );

    if (resultados.some(resultado => !resultado.correcto)) {
        throw new Error('Una o más comprobaciones devolvieron un resultado incorrecto');
    }
}

async function limpiar() {
    const db = obtenerBaseDatos();
    const usuariosPrueba = await db.collection('usuarios').find({
        email: { $in: [emailUsuario, emailInactivo] }
    }, { projection: { id: 1 } }).toArray();
    const ids = usuariosPrueba.map(usuario => usuario.id);

    if (ids.length) {
        await db.collection('ventas').deleteMany({ id_usuario: { $in: ids } });
    }

    await db.collection('productos').deleteMany({
        nombre: { $in: [nombreProducto, nombreProductoCompra] }
    });
    await db.collection('usuarios').deleteMany({
        email: { $in: [emailUsuario, emailInactivo] }
    });
}

try {
    await ejecutar();
} catch (error) {
    console.error(`Pruebas interrumpidas: ${error.message}`);
    process.exitCode = 1;
} finally {
    try {
        await limpiar();
        console.log('Datos temporales de prueba eliminados');
    } catch (error) {
        console.error(`No se pudieron limpiar todos los datos de prueba: ${error.message}`);
        process.exitCode = 1;
    }

    const correctas = resultados.filter(resultado => resultado.correcto).length;
    console.log(`Resumen: ${correctas}/${resultados.length} comprobaciones correctas`);
    await cerrarMongoDB();
}
