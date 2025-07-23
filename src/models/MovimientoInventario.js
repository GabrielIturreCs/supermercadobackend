const mongoose = require('mongoose');

const MovimientoInventarioSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  cantidad: Number,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  sucursal: String,
  motivo: String
});

module.exports = mongoose.model('MovimientoInventario', MovimientoInventarioSchema);
