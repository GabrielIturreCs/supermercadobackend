const MovimientoDeposito = require('../models/MovimientoDeposito');

exports.getAll = async (req, res) => {
  try {
    const movimientos = await MovimientoDeposito.find().populate('deposito producto usuario');
    res.json(movimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const movimiento = new MovimientoDeposito(req.body);
    await movimiento.save();
    res.status(201).json(movimiento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
