const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  inicio: { type: Date, default: Date.now },
  cierre: Date,
  cajaInicial: Number,
  cajaFinal: Number,
  sucursal: String
});

module.exports = mongoose.model('Turno', TurnoSchema);
