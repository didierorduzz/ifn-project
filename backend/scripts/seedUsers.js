const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
require('dotenv').config();

const crearUsuarios = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Limpiar usuarios existentes
    await Usuario.deleteMany({});

    // Hashear contraseñas
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const demoPass = await bcrypt.hash('demo123', salt);

    // Crear usuarios
    const usuarios = [
      {
        nombre: 'Administrador',
        correo: 'admin@ifn.com',
        password: adminPass,
        rol: 'admin',
        zona: 'Todas',
        estado: 'Activo'
      },
      {
        nombre: 'Usuario Demo',
        correo: 'demo@ifn.com',
        password: demoPass,
        rol: 'brigadista',
        zona: 'Zona Norte',
        estado: 'Activo'
      }
    ];

    await Usuario.insertMany(usuarios);
    console.log('✅ Usuarios creados exitosamente');
    console.log('\nCredenciales:');
    console.log('Admin: admin@ifn.com / admin123');
    console.log('Demo: demo@ifn.com / demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

crearUsuarios();