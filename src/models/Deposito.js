const mongoose = require('mongoose');

const DepositoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  direccion: String,
  telefono: String,
  sucursal: String
});

module.exports = mongoose.model('Deposito', DepositoSchema);
