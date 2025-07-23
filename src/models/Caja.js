const mongoose = require('mongoose');

const CajaSchema = new mongoose.Schema({
  sucursal: { type: String },
  apertura: { type: Date, default: Date.now },
  cierre: Date,
  saldoInicial: Number,
  saldoFinal: Number,
  usuarioApertura: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  usuarioCierre: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' }
});

module.exports = mongoose.model('Caja', CajaSchema);
