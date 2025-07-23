const Alerta = require('../models/Alerta');

exports.getAll = async (req, res) => {
  try {
    const alertas = await Alerta.find().populate('producto');
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const alerta = new Alerta(req.body);
    await alerta.save();
    res.status(201).json(alerta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.marcarLeida = async (req, res) => {
  try {
    const alerta = await Alerta.findByIdAndUpdate(req.params.id, { leida: true }, { new: true });
    if (!alerta) return res.status(404).json({ error: 'No encontrada' });
    res.json(alerta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
