const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/', inventarioController.getAll);
router.post('/', inventarioController.create);

module.exports = router;
