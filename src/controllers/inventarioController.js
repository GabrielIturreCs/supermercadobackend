const Inventario = require('../models/Inventario');

exports.getAll = async (req, res) => {
  try {
    const inventarios = await Inventario.find().populate('producto usuario');
    res.json(inventarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const inventario = new Inventario(req.body);
    await inventario.save();
    res.status(201).json(inventario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
