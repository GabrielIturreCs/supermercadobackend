const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

exports.getAll = async (req, res) => {
  try {
    // Filtros por fecha
    const { desde, hasta, periodo } = req.query;
    let filtroFecha = {};
    const hoy = new Date();
    let desdeFecha, hastaFecha;
    if (periodo === '10dias') {
      desdeFecha = new Date(hoy);
      desdeFecha.setDate(hoy.getDate() - 9);
      desdeFecha.setHours(0,0,0,0);
      hastaFecha = new Date(hoy);
      hastaFecha.setHours(23,59,59,999);
      filtroFecha = { createdAt: { $gte: desdeFecha, $lte: hastaFecha } };
    } else if (periodo === 'mes') {
      desdeFecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      hastaFecha = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
      filtroFecha = { createdAt: { $gte: desdeFecha, $lte: hastaFecha } };
    } else if (periodo === 'anio') {
      desdeFecha = new Date(hoy.getFullYear(), 0, 1);
      hastaFecha = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);
      filtroFecha = { createdAt: { $gte: desdeFecha, $lte: hastaFecha } };
    } else if (desde && hasta) {
      desdeFecha = new Date(desde);
      hastaFecha = new Date(hasta);
      hastaFecha.setHours(23,59,59,999);
      filtroFecha = { createdAt: { $gte: desdeFecha, $lte: hastaFecha } };
    }
    const ventas = await Venta.find(filtroFecha).populate('vendedor items.producto turno');
    // Agregar campo 'fecha' igual a 'createdAt' para compatibilidad con frontend
    const ventasConFecha = ventas.map(v => ({
      ...v.toObject(),
      fecha: v.createdAt,
      vendedor: v.vendedor ? `${v.vendedor.nombre} ${v.vendedor.apellido}` : '-',
    }));
    // Calcular totales
    const totalDia = ventasConFecha.filter(v => {
      const f = new Date(v.fecha);
      return f.toDateString() === hoy.toDateString();
    }).reduce((sum, v) => sum + v.total, 0);
    const totalMes = ventasConFecha.filter(v => {
      const f = new Date(v.fecha);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }).reduce((sum, v) => sum + v.total, 0);
    const totalAnio = ventasConFecha.filter(v => {
      const f = new Date(v.fecha);
      return f.getFullYear() === hoy.getFullYear();
    }).reduce((sum, v) => sum + v.total, 0);
    res.json({ ventas: ventasConFecha, totalDia, totalMes, totalAnio });
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
    for (const d of venta.items) {
      await Producto.findByIdAndUpdate(d.producto, { $inc: { 'stock.actual': -d.cantidad } });
    }
    await venta.save();
    res.status(201).json(venta);
  } catch (err) {
    console.error("Error al guardar venta:", err); // Log detallado
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
