const express = require('express');
const router = express.Router();
const movimientoInventarioController = require('../controllers/movimientoInventarioController');

router.get('/', movimientoInventarioController.getAll);
router.post('/', movimientoInventarioController.create);

module.exports = router;
