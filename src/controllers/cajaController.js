const Caja = require('../models/Caja');

exports.getAll = async (req, res) => {
  try {
    const cajas = await Caja.find();
    res.json(cajas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const caja = new Caja(req.body);
    await caja.save();
    res.status(201).json(caja);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cerrar = async (req, res) => {
  try {
    const caja = await Caja.findByIdAndUpdate(req.params.id, { cierre: new Date(), saldoFinal: req.body.saldoFinal, estado: 'cerrada' }, { new: true });
    if (!caja) return res.status(404).json({ error: 'No encontrada' });
    res.json(caja);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
