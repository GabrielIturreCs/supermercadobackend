const MovimientoCaja = require('../models/MovimientoCaja');

exports.getAll = async (req, res) => {
  try {
    const movimientos = await MovimientoCaja.find().populate('caja usuario');
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const movimiento = new MovimientoCaja(req.body);
    await movimiento.save();
    res.status(201).json(movimiento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
