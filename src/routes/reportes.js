const express = require('express');
const router = express.Router();

// Ruta básica para reportes
router.get('/', (req, res) => {
  res.json({ message: 'Reportes endpoint funcionando' });
});

module.exports = router;
