const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');

router.get('/', marcaController.getAll);
router.post('/', marcaController.create);
router.put('/:id', marcaController.update);
router.delete('/:id', marcaController.delete);

module.exports = router;
