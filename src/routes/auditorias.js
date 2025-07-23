const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

router.get('/', auditoriaController.getAll);
router.post('/', auditoriaController.create);

module.exports = router;
