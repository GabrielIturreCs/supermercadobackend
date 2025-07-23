const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// CRUD Ventas
router.get('/', ventaController.getAll);
router.get('/:id', ventaController.getById);
router.post('/', ventaController.create);
router.delete('/:id', ventaController.delete);

module.exports = router;
