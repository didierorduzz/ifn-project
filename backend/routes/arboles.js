const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Arbol = require('../models/Arbol');
const Subparcela = require('../models/Subparcela');

// GET /api/arboles - Obtener todos los árboles
router.get('/', auth, async (req, res) => {
  try {
    const arboles = await Arbol.find()
      .populate('usuario', 'nombre correo')
      .populate('subparcela')
      .sort({ createdAt: -1 });
    res.json(arboles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/arboles/subparcela/:codigoSub - Obtener árboles por subparcela
router.get('/subparcela/:codigoSub', auth, async (req, res) => {
  try {
    const arboles = await Arbol.find({ codigoSubparcela: req.params.codigoSub })
      .populate('usuario', 'nombre correo')
      .sort({ numIndividuo: 1 });
    res.json(arboles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/arboles - Crear nuevo árbol
router.post('/', auth, async (req, res) => {
  try {
    const {
      codigoSubparcela,
      codigoArbol,
      numIndividuo,
      especie,
      dap,
      altura,
      alturaCom,
      condicion,
      sanitario,
      observaciones
    } = req.body;

    // Verificar si ya existe el código
    const existeCodigo = await Arbol.findOne({ codigoArbol });
    if (existeCodigo) {
      return res.status(400).json({ message: 'El código de árbol ya existe' });
    }

    const nuevoArbol = new Arbol({
      codigoSubparcela,
      codigoArbol,
      numIndividuo,
      especie,
      dap,
      altura,
      alturaCom,
      condicion,
      sanitario,
      observaciones,
      usuario: req.user.id
    });

    await nuevoArbol.save();
    
    const arbolCreado = await Arbol.findById(nuevoArbol._id)
      .populate('usuario', 'nombre correo');

    res.status(201).json(arbolCreado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/arboles/:id - Actualizar árbol
router.put('/:id', auth, async (req, res) => {
  try {
    const arbol = await Arbol.findById(req.params.id);
    
    if (!arbol) {
      return res.status(404).json({ message: 'Árbol no encontrado' });
    }

    Object.keys(req.body).forEach(key => {
      arbol[key] = req.body[key];
    });

    await arbol.save();
    
    const arbolActualizado = await Arbol.findById(arbol._id)
      .populate('usuario', 'nombre correo');

    res.json(arbolActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/arboles/:id - Eliminar árbol
router.delete('/:id', auth, async (req, res) => {
  try {
    const arbol = await Arbol.findById(req.params.id);
    
    if (!arbol) {
      return res.status(404).json({ message: 'Árbol no encontrado' });
    }

    await arbol.deleteOne();
    res.json({ message: 'Árbol eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;