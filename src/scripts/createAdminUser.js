const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const exists = await Usuario.findOne({ email: 'admin@admin.com' });
  if (exists) {
    console.log('El usuario admin@admin.com ya existe.');
    process.exit(0);
  }
  const user = new Usuario({
    username: 'admin',
    email: 'admin@admin.com',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Principal',
    role: 'admin',
    activo: true
  });
  await user.save();
  console.log('Usuario administrador creado correctamente.');
  process.exit(0);
}
createAdmin();
