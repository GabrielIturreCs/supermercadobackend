const express = require('express');
const router = express.Router();

// Ruta básica para alertas
router.get('/', (req, res) => {
  res.json({ message: 'Alertas endpoint funcionando' });
});

module.exports = router;
