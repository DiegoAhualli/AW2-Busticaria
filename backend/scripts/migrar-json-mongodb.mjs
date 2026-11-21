import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    cerrarMongoDB,
    conectarMongoDB,
    crearIndices,
    obtenerBaseDatos
} from '../config/mongodb.mjs';
import { inicializarContador } from '../services/contadores.mjs';
import {
    esHashBcrypt,
    esHashScrypt,
    generarHashBcrypt
} from '../utils/passwords.mjs';

const directorio = path.dirname(fileURLToPath(import.meta.url));
const directorioDatos = path.resolve(directorio, '../../data');

async function leerArreglo(nombre) {
    const ruta = path.join(directorioDatos, nombre);
    const contenido = JSON.parse(await readFile(ruta, 'utf8'));

    if (!Array.isArray(contenido)) {
        throw new Error(`${nombre} debe contener un arreglo JSON`);
    }

    return contenido;
}

function enteroPositivo(valor) {
    return Number.isInteger(valor) && valor > 0;
}

function validarDuplicados(datos, campo, nombre) {
    const valores = new Set();

    for (const registro of datos) {
        const valor = registro[campo];
        if (valores.has(valor)) {
            throw new Error(`${nombre}: valor duplicado en ${campo}: ${valor}`);
        }
        valores.add(valor);
    }
}

function validarFuentes(usuarios, productos, ventas) {
    validarDuplicados(usuarios, 'id', 'usuarios.json');
    validarDuplicados(productos, 'id', 'productos.json');
    validarDuplicados(ventas, 'id', 'ventas.json');

    const emails = new Set();
    for (const usuario of usuarios) {
        if (
            !enteroPositivo(usuario.id) ||
            typeof usuario.nombre !== 'string' || !usuario.nombre.trim() ||
            typeof usuario.apellido !== 'string' || !usuario.apellido.trim() ||
            typeof usuario.email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email.trim()) ||
            typeof usuario.password !== 'string' || !usuario.password ||
            typeof usuario.activo !== 'boolean'
        ) {
            throw new Error(`usuarios.json: estructura inválida para el ID ${usuario.id}`);
        }

        const email = usuario.email.trim().toLowerCase();
        if (emails.has(email)) {
            throw new Error(`usuarios.json: email duplicado para el ID ${usuario.id}`);
        }
        emails.add(email);
    }

    for (const producto of productos) {
        if (
            !enteroPositivo(producto.id) ||
            typeof producto.nombre !== 'string' || !producto.nombre.trim() ||
            typeof producto.descripcion !== 'string' || !producto.descripcion.trim() ||
            typeof producto.categoria !== 'string' || !producto.categoria.trim() ||
            typeof producto.precio !== 'number' || !Number.isFinite(producto.precio) ||
            producto.precio <= 0 ||
            !Number.isInteger(producto.stock) || producto.stock < 0 ||
            typeof producto.imagen !== 'string' || !producto.imagen.trim() ||
            typeof producto.disponible !== 'boolean'
        ) {
            throw new Error(`productos.json: estructura inválida para el ID ${producto.id}`);
        }
    }

    const idsUsuarios = new Set(usuarios.map(usuario => usuario.id));
    const idsProductos = new Set(productos.map(producto => producto.id));

    for (const venta of ventas) {
        if (
            !enteroPositivo(venta.id) ||
            !enteroPositivo(venta.id_usuario) ||
            !idsUsuarios.has(venta.id_usuario) ||
            typeof venta.fecha !== 'string' ||
            typeof venta.total !== 'number' || !Number.isFinite(venta.total) ||
            venta.total <= 0 ||
            typeof venta.direccion !== 'string' || !venta.direccion.trim() ||
            typeof venta.pagada !== 'boolean' ||
            !Array.isArray(venta.productos) || !venta.productos.length
        ) {
            throw new Error(`ventas.json: estructura inválida para el ID ${venta.id}`);
        }

        const idsDetalle = new Set();
        for (const item of venta.productos) {
            if (
                !enteroPositivo(item.id_producto) ||
                !idsProductos.has(item.id_producto) ||
                !enteroPositivo(item.cantidad) ||
                idsDetalle.has(item.id_producto)
            ) {
                throw new Error(`ventas.json: detalle inválido en la venta ${venta.id}`);
            }
            idsDetalle.add(item.id_producto);
        }
    }
}

async function migrarUsuarios(usuariosFuente) {
    const coleccion = obtenerBaseDatos().collection('usuarios');
    let insertados = 0;
    let existentes = 0;
    let textoConvertido = 0;

    for (const origen of usuariosFuente) {
        const email = origen.email.trim().toLowerCase();
        const coincidencias = await coleccion.find({
            $or: [{ id: origen.id }, { email }]
        }).toArray();

        if (coincidencias.length > 1) {
            throw new Error(
                `Conflicto en MongoDB para el usuario ID ${origen.id}: ID y email pertenecen a documentos diferentes`
            );
        }

        const existente = coincidencias[0];
        if (existente) {
            if (existente.id !== origen.id || existente.email !== email) {
                throw new Error(`Conflicto de ID o email para el usuario ${origen.id}`);
            }

            if (!esHashBcrypt(existente.password) && !esHashScrypt(existente.password)) {
                await coleccion.updateOne(
                    { _id: existente._id, password: existente.password },
                    { $set: { password: await generarHashBcrypt(existente.password) } }
                );
                textoConvertido += 1;
            }

            existentes += 1;
            continue;
        }

        let password = origen.password;
        if (!esHashBcrypt(password) && !esHashScrypt(password)) {
            password = await generarHashBcrypt(password);
            textoConvertido += 1;
        }

        await coleccion.insertOne({
            ...origen,
            nombre: origen.nombre.trim(),
            apellido: origen.apellido.trim(),
            email,
            password
        });
        insertados += 1;
    }

    return { insertados, existentes, textoConvertido };
}

async function migrarPorId(nombreColeccion, datos) {
    if (!datos.length) return { insertados: 0, existentes: 0 };

    const resultado = await obtenerBaseDatos().collection(nombreColeccion).bulkWrite(
        datos.map(documento => ({
            updateOne: {
                filter: { id: documento.id },
                update: { $setOnInsert: documento },
                upsert: true
            }
        })),
        { ordered: true }
    );

    return {
        insertados: resultado.upsertedCount,
        existentes: datos.length - resultado.upsertedCount
    };
}

async function actualizarContadores() {
    const db = obtenerBaseDatos();

    for (const nombre of ['usuarios', 'productos', 'ventas']) {
        const ultimo = await db.collection(nombre)
            .find({}, { projection: { id: 1 } })
            .sort({ id: -1 })
            .limit(1)
            .next();

        await inicializarContador(nombre, ultimo?.id ?? 0);
    }
}

async function verificarMigracion(fuentes) {
    const db = obtenerBaseDatos();
    const verificacion = {};

    for (const [nombre, datos] of Object.entries(fuentes)) {
        const ids = datos.map(documento => documento.id);
        const presentes = await db.collection(nombre).countDocuments({ id: { $in: ids } });

        if (presentes !== datos.length) {
            throw new Error(
                `Verificación fallida en ${nombre}: ${presentes}/${datos.length} IDs presentes`
            );
        }

        verificacion[nombre] = { fuente: datos.length, presentes };
    }

    return verificacion;
}

async function ejecutar() {
    const usuarios = await leerArreglo('usuarios.json');
    const productos = await leerArreglo('productos.json');
    const ventas = await leerArreglo('ventas.json');
    validarFuentes(usuarios, productos, ventas);

    await conectarMongoDB();
    await crearIndices();

    const resultadoUsuarios = await migrarUsuarios(usuarios);
    const resultadoProductos = await migrarPorId('productos', productos);
    const resultadoVentas = await migrarPorId('ventas', ventas);

    await actualizarContadores();
    const verificacion = await verificarMigracion({ usuarios, productos, ventas });

    console.log('Migración JSON -> MongoDB completada');
    console.log('Usuarios:', resultadoUsuarios);
    console.log('Productos:', resultadoProductos);
    console.log('Ventas:', resultadoVentas);
    console.log('Verificación:', verificacion);
}

try {
    await ejecutar();
} catch (error) {
    console.error(`Migración cancelada: ${error.message}`);
    process.exitCode = 1;
} finally {
    await cerrarMongoDB();
}
