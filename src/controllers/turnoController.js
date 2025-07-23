const Turno = require('../models/Turno');

exports.getAll = async (req, res) => {
  try {
    const turnos = await Turno.find().populate('usuario');
    res.json(turnos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const turno = new Turno(req.body);
    await turno.save();
    res.status(201).json(turno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cerrar = async (req, res) => {
  try {
    const turno = await Turno.findByIdAndUpdate(req.params.id, { cierre: new Date(), cajaFinal: req.body.cajaFinal }, { new: true });
    if (!turno) return res.status(404).json({ error: 'No encontrado' });
    res.json(turno);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
