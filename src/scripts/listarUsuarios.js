const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
require('dotenv').config();

async function listarUsuarios() {
  await mongoose.connect(process.env.MONGODB_URI);
  const usuarios = await Usuario.find({});
  console.log('Usuarios en la base de datos:');
  usuarios.forEach(u => {
    console.log({
      id: u._id,
      username: u.username,
      email: u.email,
      activo: u.activo,
      role: u.role,
      sucursal: u.sucursal,
      password: u.password,
      nombre: u.nombre,
      apellido: u.apellido
    });
  });
  process.exit(0);
}

listarUsuarios();
