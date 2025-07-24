const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

exports.getAll = async (req, res) => {
  try {
    const ventas = await Venta.find().populate('vendedor items.producto turno');
    // Agregar campo 'fecha' igual a 'createdAt' para compatibilidad con frontend
    const ventasConFecha = ventas.map(v => ({
      ...v.toObject(),
      fecha: v.createdAt
    }));
    res.json(ventasConFecha);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('vendedor items.producto turno');
    if (!venta) return res.status(404).json({ error: 'No encontrado' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const venta = new Venta(req.body);
    // Baja automática de stock
    for (const d of venta.detalles) {
      await Producto.findByIdAndUpdate(d.producto, { $inc: { stock: -d.cantidad } });
    }
    await venta.save();
    res.status(201).json(venta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const venta = await Venta.findByIdAndDelete(req.params.id);
    if (!venta) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
