const Sucursal = require('../models/Sucursal');

exports.getAll = async (req, res) => {
  try {
    const sucursales = await Sucursal.find();
    res.json(sucursales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const sucursal = new Sucursal(req.body);
    await sucursal.save();
    res.status(201).json(sucursal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
