const mongoose = require('mongoose');

const InventarioSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  cantidad: Number,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  sucursal: String
});

module.exports = mongoose.model('Inventario', InventarioSchema);
