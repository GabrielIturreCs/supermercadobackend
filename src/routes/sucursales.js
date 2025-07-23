const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');

router.get('/', sucursalController.getAll);
router.post('/', sucursalController.create);

module.exports = router;
