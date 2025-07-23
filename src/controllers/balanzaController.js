const Balanza = require('../models/Balanza');

exports.getAll = async (req, res) => {
  try {
    const balanzas = await Balanza.find().populate('producto usuario');
    res.json(balanzas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const balanza = new Balanza(req.body);
    await balanza.save();
    res.status(201).json(balanza);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
