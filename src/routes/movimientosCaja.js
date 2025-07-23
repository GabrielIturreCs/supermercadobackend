const express = require('express');
const router = express.Router();
const movimientoCajaController = require('../controllers/movimientoCajaController');

router.get('/', movimientoCajaController.getAll);
router.post('/', movimientoCajaController.create);

module.exports = router;
