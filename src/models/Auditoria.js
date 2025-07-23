const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  accion: String,
  entidad: String,
  entidadId: String,
  fecha: { type: Date, default: Date.now },
  descripcion: String
});

module.exports = mongoose.model('Auditoria', AuditoriaSchema);
