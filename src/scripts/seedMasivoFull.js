// Script masivo para poblar TODOS los módulos principales: categorías, productos, usuarios, stock, reportes, configuración, etc.
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Venta = require('../models/Venta');
const Stock = require('../models/Inventario');
const Reporte = require('../models/Auditoria');
const Configuracion = require('../models/Sucursal');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/supermeercado';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');



  // 1. Categorías
  const categoriasData = [
    { nombre: 'Bebidas', descripcion: 'Bebidas y refrescos' },
    { nombre: 'Lácteos', descripcion: 'Productos lácteos' },
    { nombre: 'Snacks', descripcion: 'Snacks y golosinas' },
    { nombre: 'Limpieza', descripcion: 'Artículos de limpieza' },
    { nombre: 'Panadería', descripcion: 'Pan y derivados' },
  ];
  await Categoria.deleteMany({});
  const categorias = await Categoria.insertMany(categoriasData);
  console.log('Categorías insertadas:', categorias.length);

  // 2. Sucursal (Configuración)
  await Configuracion.deleteMany({});
  const sucursal = await Configuracion.create({ nombre: 'Sucursal Central', direccion: 'Av. Principal 123', telefono: '123456789' });
  console.log('Sucursal insertada:', sucursal.nombre);

  // 3. Usuarios (con todos los campos requeridos)
  await Usuario.deleteMany({ username: { $ne: 'admin' } });
  const usuariosData = [
    { username: 'admin', password: 'admin123', email: 'admin@mail.com', nombre: 'Administrador', apellido: 'Principal', role: 'admin' },
    { username: 'cajero1', password: '123456', email: 'cajero1@mail.com', nombre: 'Cajero', apellido: 'Uno', role: 'cajero', sucursal: sucursal._id },
    { username: 'gerente1', password: '123456', email: 'gerente1@mail.com', nombre: 'Gerente', apellido: 'Uno', role: 'gerente', sucursal: sucursal._id },
    { username: 'reponedor1', password: '123456', email: 'reponedor1@mail.com', nombre: 'Reponedor', apellido: 'Uno', role: 'reponedor', sucursal: sucursal._id },
  ];
  // Usar .save() para encriptar la contraseña correctamente
  const usuarios = [];
  for (const data of usuariosData) {
    const user = new Usuario(data);
    await user.save();
    usuarios.push(user);
  }
  console.log('Usuarios insertados:', usuarios.length);

  // 4. Productos (con todos los campos requeridos)
  function getCategoriaId(nombre) {
    const cat = categorias.find(c => c.nombre === nombre);
    return cat ? cat._id : categorias[0]._id;
  }
  const productosData = [
    {
      codigo: 'P0001',
      nombre: 'Coca Cola 1.5L',
      descripcion: 'Bebida gaseosa',
      categoria: getCategoriaId('Bebidas'),
      precios: { minorista: 1200, mayorista: 1100, costo: 900 },
      stock: { actual: 50, minimo: 5, maximo: 100, unidad: 'unidades' },
      marca: 'Coca Cola',
      activo: true,
      codigoBarras: '7790895000011',
      imagen: '',
      variantes: [],
      tags: ['bebida', 'gaseosa'],
      ubicacion: { pasillo: '1', estante: 'A', nivel: '1' },
    },
    {
      codigo: 'P0002',
      nombre: 'Leche Entera',
      descripcion: 'Leche entera 1L',
      categoria: getCategoriaId('Lácteos'),
      precios: { minorista: 900, mayorista: 850, costo: 700 },
      stock: { actual: 40, minimo: 5, maximo: 80, unidad: 'unidades' },
      marca: 'La Serenísima',
      activo: true,
      codigoBarras: '7790895000028',
      imagen: '',
      variantes: [],
      tags: ['lácteo', 'leche'],
      ubicacion: { pasillo: '2', estante: 'B', nivel: '1' },
    },
    {
      codigo: 'P0003',
      nombre: 'Galletitas Chocolinas',
      descripcion: 'Galletitas dulces',
      categoria: getCategoriaId('Snacks'),
      precios: { minorista: 700, mayorista: 650, costo: 500 },
      stock: { actual: 60, minimo: 5, maximo: 90, unidad: 'unidades' },
      marca: 'Bagley',
      activo: true,
      codigoBarras: '7790895000035',
      imagen: '',
      variantes: [],
      tags: ['snack', 'galletita'],
      ubicacion: { pasillo: '3', estante: 'C', nivel: '1' },
    },
    {
      codigo: 'P0004',
      nombre: 'Lavandina',
      descripcion: 'Desinfectante',
      categoria: getCategoriaId('Limpieza'),
      precios: { minorista: 500, mayorista: 450, costo: 300 },
      stock: { actual: 30, minimo: 5, maximo: 60, unidad: 'unidades' },
      marca: 'Ayudín',
      activo: true,
      codigoBarras: '7790895000042',
      imagen: '',
      variantes: [],
      tags: ['limpieza', 'desinfectante'],
      ubicacion: { pasillo: '4', estante: 'D', nivel: '1' },
    },
    {
      codigo: 'P0005',
      nombre: 'Pan Lactal',
      descripcion: 'Pan de molde',
      categoria: getCategoriaId('Panadería'),
      precios: { minorista: 800, mayorista: 750, costo: 600 },
      stock: { actual: 35, minimo: 5, maximo: 70, unidad: 'unidades' },
      marca: 'Bimbo',
      activo: true,
      codigoBarras: '7790895000059',
      imagen: '',
      variantes: [],
      tags: ['pan', 'panadería'],
      ubicacion: { pasillo: '5', estante: 'E', nivel: '1' },
    },
  ];
  await Producto.deleteMany({});
  const productos = await Producto.insertMany(productosData);
  console.log('Productos insertados:', productos.length);

  // 5. Stock (Inventario)
  await Stock.deleteMany({});
  const stockData = productos.map((prod, i) => ({ producto: prod._id, cantidad: prod.stock.actual, usuario: usuarios[0]._id, sucursal: sucursal._id }));
  await Stock.insertMany(stockData);
  console.log('Stock insertado:', stockData.length);

  // 6. Reportes (Auditoría)
  await Reporte.deleteMany({});
  const reportesData = [
    { usuario: usuarios[0]._id, accion: 'Venta realizada', entidad: 'Venta', entidadId: '1', fecha: new Date(), descripcion: 'Venta de productos varios.' },
    { usuario: usuarios[1]._id, accion: 'Stock actualizado', entidad: 'Inventario', entidadId: '1', fecha: new Date(), descripcion: 'Ingreso de mercadería.' },
  ];
  await Reporte.insertMany(reportesData);
  console.log('Reportes insertados:', reportesData.length);

  // 7. Ventas (con todos los campos requeridos)
  await Venta.deleteMany({});
  const ventasData = [
    {
      numero: 'V00000001',
      items: [
        {
          producto: productos[0]._id,
          codigo: productos[0].codigo,
          nombre: productos[0].nombre,
          cantidad: 2,
          precio: productos[0].precios.minorista,
          subtotal: productos[0].precios.minorista * 2,
        },
        {
          producto: productos[2]._id,
          codigo: productos[2].codigo,
          nombre: productos[2].nombre,
          cantidad: 1,
          precio: productos[2].precios.minorista,
          subtotal: productos[2].precios.minorista,
        },
      ],
      subtotal: productos[0].precios.minorista * 2 + productos[2].precios.minorista,
      descuento: 0,
      impuestos: 0,
      total: productos[0].precios.minorista * 2 + productos[2].precios.minorista,
      metodoPago: 'efectivo',
      detallesPago: { efectivo: productos[0].precios.minorista * 2 + productos[2].precios.minorista, tarjeta: 0, transferencia: 0, cambio: 0 },
      vendedor: usuarios[0]._id,
      sucursal: sucursal._id,
      estado: 'completada',
      fecha: new Date(),
    },
    {
      numero: 'V00000002',
      items: [
        {
          producto: productos[1]._id,
          codigo: productos[1].codigo,
          nombre: productos[1].nombre,
          cantidad: 3,
          precio: productos[1].precios.minorista,
          subtotal: productos[1].precios.minorista * 3,
        },
      ],
      subtotal: productos[1].precios.minorista * 3,
      descuento: 0,
      impuestos: 0,
      total: productos[1].precios.minorista * 3,
      metodoPago: 'tarjeta',
      detallesPago: { efectivo: 0, tarjeta: productos[1].precios.minorista * 3, transferencia: 0, cambio: 0 },
      vendedor: usuarios[1]._id,
      sucursal: sucursal._id,
      estado: 'completada',
      fecha: new Date(),
    },
  ];
  await Venta.insertMany(ventasData);
  console.log('Ventas insertadas:', ventasData.length);

  await mongoose.disconnect();
  console.log('Seed masivo FULL completado.');
}

seed().catch((e) => {
  console.error(e);
  mongoose.disconnect();
});
