const Vencimiento = require('../models/Vencimiento');

exports.getAll = async (req, res) => {
  try {
    const vencimientos = await Vencimiento.find().populate('producto');
    res.json(vencimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const vencimiento = new Vencimiento(req.body);
    await vencimiento.save();
    res.status(201).json(vencimiento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
