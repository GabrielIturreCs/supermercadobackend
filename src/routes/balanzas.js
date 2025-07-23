const express = require('express');
const router = express.Router();
const balanzaController = require('../controllers/balanzaController');

router.get('/', balanzaController.getAll);
router.post('/', balanzaController.create);

module.exports = router;
