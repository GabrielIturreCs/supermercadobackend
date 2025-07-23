const mongoose = require('mongoose');

const SucursalSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  direccion: String,
  telefono: String
});

module.exports = mongoose.model('Sucursal', SucursalSchema);
