const mongoose = require('mongoose');

const MovimientoCajaSchema = new mongoose.Schema({
  caja: { type: mongoose.Schema.Types.ObjectId, ref: 'Caja' },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  monto: { type: Number, required: true },
  descripcion: String,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('MovimientoCaja', MovimientoCajaSchema);
