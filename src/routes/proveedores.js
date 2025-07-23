const express = require('express');
const router = express.Router();

// Ruta básica para proveedores
router.get('/', (req, res) => {
  res.json({ message: 'Proveedores endpoint funcionando' });
});

module.exports = router;
