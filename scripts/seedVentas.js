// Script para crear 10 ventas de prueba
const mongoose = require('mongoose');
const Venta = require('../src/models/Venta');
const Producto = require('../src/models/Producto');
const Usuario = require('../src/models/Usuario');
require('dotenv').config({ path: '../.env' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Eliminar todas las ventas previas
  await Venta.deleteMany({});
  const productos = await Producto.find().limit(5);
  const usuarios = await Usuario.find().limit(2);
  if (productos.length === 0 || usuarios.length === 0) throw new Error('Se requieren productos y usuarios');

  for (let i = 0; i < 10; i++) {
    const cantidad = 1 + Math.floor(Math.random() * 3);
    const producto = productos[i % productos.length];
    const items = [
      {
        producto: producto._id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad,
        precio: producto.precios.minorista,
        subtotal: producto.precios.minorista * cantidad,
      },
    ];
    const venta = new Venta({
      numero: `V${String(Date.now() + i).slice(-8)}`,
      items,
      subtotal: items.reduce((sum, it) => sum + it.subtotal, 0),
      descuento: 0,
      impuestos: 0,
      total: items.reduce((sum, it) => sum + it.subtotal, 0),
      metodoPago: 'efectivo',
      vendedor: usuarios[i % usuarios.length]._id,
      estado: 'completada',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await venta.save();
    console.log('Venta creada:', venta.numero);
  }
  await mongoose.disconnect();
  console.log('Listo.');
}

main().catch(e => { console.error(e); process.exit(1); });
