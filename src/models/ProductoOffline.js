const mongoose = require('mongoose');

const ProductoOfflineSchema = new mongoose.Schema({
  nombre: String,
  codigo: String,
  stock: Number,
  precio: Number,
  sucursal: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductoOffline', ProductoOfflineSchema);
