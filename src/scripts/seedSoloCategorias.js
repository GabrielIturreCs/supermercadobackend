// Script para poblar solo categorías de ejemplo
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');


const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/supermeercado';
console.log('Intentando conectar a:', MONGO_URI);

async function seedCategorias() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error de conexión:', err);
    process.exit(1);
  }

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

  await mongoose.disconnect();
  console.log('Seed de categorías completado.');
}

seedCategorias().catch((e) => {
  console.error(e);
  mongoose.disconnect();
});
