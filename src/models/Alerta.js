const mongoose = require('mongoose');

const AlertaSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['stock', 'vencimiento', 'venta', 'caja'], required: true },
  mensaje: String,
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  fecha: { type: Date, default: Date.now },
  leida: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alerta', AlertaSchema);
