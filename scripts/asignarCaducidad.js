// Script para asignar una fecha de caducidad de prueba a todos los productos
const mongoose = require('mongoose');
const Producto = require('../src/models/Producto');
const dotenv = require('dotenv');
const fs = require('fs');
if (fs.existsSync('./.env')) {
  dotenv.config({ path: './.env', override: true });
} else {
  dotenv.config({ path: '../.env', override: true });
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('No se encontró MONGO_URI en el .env');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const productos = await Producto.find();
  if (!productos.length) throw new Error('No hay productos en la base de datos');

  // Asignar una fecha de caducidad a 7 días desde hoy
  const nuevaCaducidad = new Date();
  nuevaCaducidad.setDate(nuevaCaducidad.getDate() + 7);

  for (const prod of productos) {
    prod.caducidad = nuevaCaducidad;
    await prod.save();
    console.log(`Producto actualizado: ${prod.nombre} (${prod.codigo}) - caducidad: ${nuevaCaducidad.toISOString().slice(0,10)}`);
  }

  await mongoose.disconnect();
  console.log('Todos los productos actualizados con fecha de caducidad.');
}

main().catch(e => { console.error(e); process.exit(1); });
