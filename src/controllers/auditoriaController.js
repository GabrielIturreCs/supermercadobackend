const Auditoria = require('../models/Auditoria');

exports.getAll = async (req, res) => {
  try {
    const auditorias = await Auditoria.find().populate('usuario');
    res.json(auditorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const auditoria = new Auditoria(req.body);
    await auditoria.save();
    res.status(201).json(auditoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
