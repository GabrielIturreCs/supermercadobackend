const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/cajaController');

router.get('/', cajaController.getAll);
router.post('/', cajaController.create);
router.put('/:id/cerrar', cajaController.cerrar);

module.exports = router;
