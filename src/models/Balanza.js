const mongoose = require('mongoose');

const BalanzaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  peso: Number,
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  sucursal: String
});

module.exports = mongoose.model('Balanza', BalanzaSchema);
