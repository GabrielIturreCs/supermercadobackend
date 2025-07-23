const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// CRUD Categorías
router.get('/', categoriaController.getAll);
router.post('/', categoriaController.create);
router.put('/:id', categoriaController.update);
router.delete('/:id', categoriaController.delete);

module.exports = router;
