const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Subparcela = require('../models/Subparcela');
const Conglomerado = require('../models/Conglomerado');

// GET /api/subparcelas - Obtener todas las subparcelas
router.get('/', auth, async (req, res) => {
  try {
    const subparcelas = await Subparcela.find()
      .populate('usuario', 'nombre correo')
      .populate('conglomerado')
      .sort({ createdAt: -1 });
    res.json(subparcelas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/subparcelas/conglomerado/:codigoCong - Obtener subparcelas por conglomerado
router.get('/conglomerado/:codigoCong', auth, async (req, res) => {
  try {
    const subparcelas = await Subparcela.find({ codigoCong: req.params.codigoCong })
      .populate('usuario', 'nombre correo')
      .sort({ numeroSub: 1 });
    res.json(subparcelas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/subparcelas - Crear nueva subparcela
router.post('/', auth, async (req, res) => {
  try {
    const {
      codigoCong,
      numeroSub,
      latitud,
      longitud,
      altitud,
      pendiente,
      exposicion,
      cobertura,
      observaciones
    } = req.body;

    // Verificar que existe el conglomerado
    const conglomerado = await Conglomerado.findOne({ codigo: codigoCong });
    if (!conglomerado) {
      return res.status(404).json({ message: 'Conglomerado no encontrado' });
    }

    const nuevaSubparcela = new Subparcela({
      codigoCong,
      numeroSub,
      latitud,
      longitud,
      altitud,
      pendiente,
      exposicion,
      cobertura,
      observaciones,
      conglomerado: conglomerado._id,
      usuario: req.user.id
    });

    await nuevaSubparcela.save();
    
    const subparcelaCreada = await Subparcela.findById(nuevaSubparcela._id)
      .populate('usuario', 'nombre correo')
      .populate('conglomerado');

    res.status(201).json(subparcelaCreada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/subparcelas/:id - Actualizar subparcela
router.put('/:id', auth, async (req, res) => {
  try {
    const subparcela = await Subparcela.findById(req.params.id);
    
    if (!subparcela) {
      return res.status(404).json({ message: 'Subparcela no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      subparcela[key] = req.body[key];
    });

    await subparcela.save();
    
    const subparcelaActualizada = await Subparcela.findById(subparcela._id)
      .populate('usuario', 'nombre correo')
      .populate('conglomerado');

    res.json(subparcelaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/subparcelas/:id - Eliminar subparcela
router.delete('/:id', auth, async (req, res) => {
  try {
    const subparcela = await Subparcela.findById(req.params.id);
    
    if (!subparcela) {
      return res.status(404).json({ message: 'Subparcela no encontrada' });
    }

    await subparcela.deleteOne();
    res.json({ message: 'Subparcela eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;