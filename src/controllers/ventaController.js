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
    console.log('POST /api/ventas - body:', JSON.stringify(req.body, null, 2));
    const venta = new Venta(req.body);
    console.log('Venta instanciada:', venta);
    // Baja automática de stock usando items
    if (!venta.items || !Array.isArray(venta.items)) {
      console.log('Error: items no es array o no existe');
    }
    for (const item of (venta.items || [])) {
      console.log('Procesando item:', item);
      await Producto.findByIdAndUpdate(item.producto, { $inc: { 'stock.actual': -item.cantidad } });
    }
    await venta.save();
    console.log('Venta guardada OK:', venta._id);
    res.status(201).json(venta);
  } catch (err) {
    console.log('Error al crear venta:', err.message, err);
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
