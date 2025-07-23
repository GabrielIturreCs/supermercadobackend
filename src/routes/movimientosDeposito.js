const express = require('express');
const router = express.Router();
const movimientoDepositoController = require('../controllers/movimientoDepositoController');

router.get('/', movimientoDepositoController.getAll);
router.post('/', movimientoDepositoController.create);

module.exports = router;
