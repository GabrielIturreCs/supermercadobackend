const MovimientoInventario = require('../models/MovimientoInventario');

exports.getAll = async (req, res) => {
  try {
    const movimientos = await MovimientoInventario.find().populate('producto usuario');
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const movimiento = new MovimientoInventario(req.body);
    await movimiento.save();
    res.status(201).json(movimiento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
