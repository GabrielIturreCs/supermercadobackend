const express = require('express');
const router = express.Router();
const vencimientoController = require('../controllers/vencimientoController');

router.get('/', vencimientoController.getAll);
router.post('/', vencimientoController.create);

module.exports = router;
