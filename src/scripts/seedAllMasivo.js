// Script masivo para poblar categorías, productos, usuarios y ventas de prueba
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Venta = require('../models/Venta');

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

  // 2. Productos
  const productosData = [
    { nombre: 'Coca Cola 1.5L', descripcion: 'Bebida gaseosa', categoria: categorias[0]._id, precio_minorista: 1200, precio_mayorista: 1100, stock: 50 },
    { nombre: 'Leche Entera', descripcion: 'Leche entera 1L', categoria: categorias[1]._id, precio_minorista: 900, precio_mayorista: 850, stock: 40 },
    { nombre: 'Galletitas Chocolinas', descripcion: 'Galletitas dulces', categoria: categorias[2]._id, precio_minorista: 700, precio_mayorista: 650, stock: 60 },
    { nombre: 'Lavandina', descripcion: 'Desinfectante', categoria: categorias[3]._id, precio_minorista: 500, precio_mayorista: 450, stock: 30 },
    { nombre: 'Pan Lactal', descripcion: 'Pan de molde', categoria: categorias[4]._id, precio_minorista: 800, precio_mayorista: 750, stock: 35 },
  ];
  await Producto.deleteMany({});
  const productos = await Producto.insertMany(productosData);
  console.log('Productos insertados:', productos.length);

  // 3. Usuarios
  await Usuario.deleteMany({ username: { $ne: 'admin' } });
  const usuariosData = [
    { username: 'cajero1', password: '123456', email: 'cajero1@mail.com', role: 'cajero' },
    { username: 'gerente1', password: '123456', email: 'gerente1@mail.com', role: 'gerente' },
    { username: 'reponedor1', password: '123456', email: 'reponedor1@mail.com', role: 'reponedor' },
  ];
  const usuarios = await Usuario.insertMany(usuariosData);
  console.log('Usuarios insertados:', usuarios.length);

  // 4. Ventas (simples)
  await Venta.deleteMany({});
  const ventasData = [
    {
      productos: [
        { producto: productos[0]._id, cantidad: 2, precio: productos[0].precio_minorista },
        { producto: productos[2]._id, cantidad: 1, precio: productos[2].precio_minorista },
      ],
      total: productos[0].precio_minorista * 2 + productos[2].precio_minorista,
      usuario: usuarios[0]._id,
      fecha: new Date(),
    },
    {
      productos: [
        { producto: productos[1]._id, cantidad: 3, precio: productos[1].precio_minorista },
      ],
      total: productos[1].precio_minorista * 3,
      usuario: usuarios[1]._id,
      fecha: new Date(),
    },
  ];
  await Venta.insertMany(ventasData);
  console.log('Ventas insertadas:', ventasData.length);

  await mongoose.disconnect();
  console.log('Seed masivo completado.');
}

seed().catch((e) => {
  console.error(e);
  mongoose.disconnect();
});
