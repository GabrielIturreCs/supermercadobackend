const mongoose = require('mongoose');

const MovimientoDepositoSchema = new mongoose.Schema({
  deposito: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposito' },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  cantidad: Number,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  motivo: String
});

module.exports = mongoose.model('MovimientoDeposito', MovimientoDepositoSchema);
