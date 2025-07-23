// Script para cargar categorías y productos automáticamente desde un texto pegado
// Uso: node scripts/cargarCategoriasYProductos.js

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Categoria = require(path.join(__dirname, '../src/models/Categoria'));
const Producto = require(path.join(__dirname, '../src/models/Producto'));
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

// Pega aquí el texto de la tabla (puedes cargarlo de un archivo si prefieres)
const DATA = `CATEGORIA PRODUCTO PROVEEDOR EAN SIN TAC ... (PEGA AQUÍ TODO EL TEXTO)`;

// Configuración de conexión
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/supermeercado';

// Función para obtener una fecha de caducidad aleatoria (entre 30 y 365 días desde hoy)
function randomCaducidad() {
  const dias = Math.floor(Math.random() * (365 - 30 + 1)) + 30;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

// Parsear el texto pegado en líneas y columnas
function parseData(texto) {
  const lineas = texto.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('CATEGORIA'));
  const productos = [];
  for (const linea of lineas) {
    // Separar por espacios múltiples o tabulaciones, pero unir los campos de nombre largos
    // Ejemplo: CATEGORIA PRODUCTO PROVEEDOR EAN ...
    // Usamos una expresión regular para capturar los campos principales
    const match = linea.match(/^(.*?)\s{2,}(.*?)\s{2,}(.*?)\s{2,}(\d{8,13})(.*)$/);
    if (match) {
      const [_, categoria, nombre, proveedor, codigo, resto] = match;
      // Buscar SI, observaciones, precios, etc en el resto
      const sinTacc = /SI/.test(resto);
      const observaciones = resto.replace(/\$[\d,.]+/g, '').replace(/SI/g, '').trim();
      productos.push({
        categoria: categoria.trim(),
        nombre: nombre.trim(),
        proveedor: proveedor.trim(),
        codigo: codigo.trim(),
        sinTacc,
        observaciones,
      });
    }
  }
  return productos;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  const productos = parseData(DATA);
  // 1. Crear categorías únicas
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
  const categoriaMap = {};
  for (const nombreCat of categoriasUnicas) {
    let cat = await Categoria.findOne({ nombre: nombreCat });
    if (!cat) {
      cat = await Categoria.create({ nombre: nombreCat });
      console.log('Categoría creada:', nombreCat);
    }
    categoriaMap[nombreCat] = cat._id;
  }

  // 2. Crear productos
  for (const p of productos) {
    // Verificar si ya existe por código
    const existe = await Producto.findOne({ codigo: p.codigo });
    if (existe) {
      console.log('Ya existe producto:', p.nombre, p.codigo);
      continue;
    }
    await Producto.create({
      nombre: p.nombre,
      categoria: categoriaMap[p.categoria],
      proveedor: p.proveedor,
      codigo: p.codigo,
      sinTacc: p.sinTacc,
      observaciones: p.observaciones,
      stock: 0,
      stockMinimo: 0,
      unidad_minima: 1,
      precio: 0,
      caducidad: randomCaducidad(),
      // Puedes agregar más campos según tu modelo
    });
    console.log('Producto creado:', p.nombre, p.codigo);
  }

  await mongoose.disconnect();
  console.log('Carga finalizada.');
}

main().catch(e => { console.error(e); process.exit(1); });
