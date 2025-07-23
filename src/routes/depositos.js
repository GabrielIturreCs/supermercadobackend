const express = require('express');
const router = express.Router();
const depositoController = require('../controllers/depositoController');

router.get('/', depositoController.getAll);
router.post('/', depositoController.create);

module.exports = router;
