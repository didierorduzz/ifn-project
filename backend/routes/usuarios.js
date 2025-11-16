const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// GET /api/usuarios - Obtener todos los usuarios (solo admin)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/usuarios/brigadistas - Obtener solo brigadistas (solo admin)
router.get('/brigadistas', [auth, admin], async (req, res) => {
  try {
    const brigadistas = await Usuario.find({ rol: 'brigadista' }).select('-password');
    res.json(brigadistas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/usuarios/:id - Obtener un usuario por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Solo el mismo usuario o un admin pueden actualizar
    if (req.user.id !== req.params.id && req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Actualizar campos permitidos
    const { nombre, correo, zona, estado, foto, password } = req.body;
    
    if (nombre) usuario.nombre = nombre;
    if (correo) usuario.correo = correo;
    if (zona) usuario.zona = zona;
    if (estado) usuario.estado = estado;
    if (foto) usuario.foto = foto;
    
    // Si hay nueva contraseña
    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    await usuario.save();
    
    const usuarioActualizado = await Usuario.findById(usuario._id).select('-password');
    res.json(usuarioActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario (solo admin)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;