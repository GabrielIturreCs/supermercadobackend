// Script para agregar productos masivos de prueba

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Producto = require('../models/Producto');

const productos = [
  { nombre: 'Coca Cola 1.5L', codigo: 'CC1500', stock: 50, precios: [{ tipo: 'minorista', valor: 1200 }], alertaStock: 10 },
  { nombre: 'Pepsi 1.5L', codigo: 'PP1500', stock: 40, precios: [{ tipo: 'minorista', valor: 1100 }], alertaStock: 10 },
  { nombre: 'Fanta 1.5L', codigo: 'FT1500', stock: 30, precios: [{ tipo: 'minorista', valor: 1150 }], alertaStock: 10 },
  { nombre: 'Sprite 1.5L', codigo: 'SP1500', stock: 25, precios: [{ tipo: 'minorista', valor: 1150 }], alertaStock: 10 },
  { nombre: 'Agua Mineral 2L', codigo: 'AG2000', stock: 60, precios: [{ tipo: 'minorista', valor: 900 }], alertaStock: 15 },
  { nombre: 'Cerveza Quilmes 1L', codigo: 'CQ1000', stock: 20, precios: [{ tipo: 'minorista', valor: 1500 }], alertaStock: 5 },
  { nombre: 'Yerba Mate Taragüi 1kg', codigo: 'YM1000', stock: 35, precios: [{ tipo: 'minorista', valor: 2500 }], alertaStock: 8 },
  { nombre: 'Azúcar Ledesma 1kg', codigo: 'AZ1000', stock: 45, precios: [{ tipo: 'minorista', valor: 950 }], alertaStock: 10 },
  { nombre: 'Aceite Natura 900ml', codigo: 'AC0900', stock: 28, precios: [{ tipo: 'minorista', valor: 1800 }], alertaStock: 7 },
  { nombre: 'Harina Blancaflor 1kg', codigo: 'HB1000', stock: 32, precios: [{ tipo: 'minorista', valor: 850 }], alertaStock: 10 },
  // Puedes agregar más productos aquí
];

async function agregarProductos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');
    await Producto.insertMany(productos);
    console.log('Productos agregados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error agregando productos:', err);
    process.exit(1);
  }
}

agregarProductos();
