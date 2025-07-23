const mongoose = require('mongoose');

const VencimientoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
  fechaVencimiento: Date,
  cantidad: Number,
  sucursal: String
});

module.exports = mongoose.model('Vencimiento', VencimientoSchema);
