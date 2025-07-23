const mongoose = require('mongoose');

const IngresoEgresoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  monto: { type: Number, required: true },
  descripcion: String,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  turno: { type: mongoose.Schema.Types.ObjectId, ref: 'Turno' },
  sucursal: String
});

module.exports = mongoose.model('IngresoEgreso', IngresoEgresoSchema);
