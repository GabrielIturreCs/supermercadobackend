const Marca = require('../models/Marca');

exports.getAll = async (req, res) => {
  try {
    const marcas = await Marca.find();
    res.json(marcas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const marca = new Marca(req.body);
    await marca.save();
    res.status(201).json(marca);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const marca = await Marca.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!marca) return res.status(404).json({ error: 'No encontrado' });
    res.json(marca);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const marca = await Marca.findByIdAndDelete(req.params.id);
    if (!marca) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
