// Script para agregar categorías de prueba
const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const categorias = [
  { nombre: 'Bebidas', descripcion: 'Gaseosas, aguas, jugos, cervezas' },
  { nombre: 'Almacén', descripcion: 'Yerba, azúcar, harina, aceites, fideos' },
  { nombre: 'Limpieza', descripcion: 'Detergentes, lavandina, esponjas' },
  { nombre: 'Lácteos', descripcion: 'Leche, yogur, quesos' },
  { nombre: 'Snacks', descripcion: 'Galletitas, papas, chocolates' }
];

async function agregarCategorias() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    await Categoria.insertMany(categorias);
    console.log('Categorías agregadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error agregando categorías:', err);
    process.exit(1);
  }
}

agregarCategorias();
