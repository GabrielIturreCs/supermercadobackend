const express = require('express');
const router = express.Router();
const ingresoEgresoController = require('../controllers/ingresoEgresoController');

router.get('/', ingresoEgresoController.getAll);
router.post('/', ingresoEgresoController.create);

module.exports = router;
