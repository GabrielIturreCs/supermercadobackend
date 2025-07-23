const Deposito = require('../models/Deposito');

exports.getAll = async (req, res) => {
  try {
    const depositos = await Deposito.find();
    res.json(depositos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const deposito = new Deposito(req.body);
    await deposito.save();
    res.status(201).json(deposito);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
