const mongoose = require('mongoose');

const MarcaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String
});

module.exports = mongoose.model('Marca', MarcaSchema);
