const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Muestra = require('../models/Muestra');
const Arbol = require('../models/Arbol');

// GET /api/muestras - Obtener todas las muestras
router.get('/', auth, async (req, res) => {
  try {
    const muestras = await Muestra.find()
      .populate('usuario', 'nombre correo')
      .populate('arbol')
      .sort({ createdAt: -1 });
    res.json(muestras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/muestras/arbol/:codigoArbol - Obtener muestras por árbol
router.get('/arbol/:codigoArbol', auth, async (req, res) => {
  try {
    const muestras = await Muestra.find({ codigoArbol: req.params.codigoArbol })
      .populate('usuario', 'nombre correo')
      .sort({ fecha: -1 });
    res.json(muestras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/muestras/usuario/:usuarioId - Obtener muestras por usuario (brigadista)
router.get('/usuario/:usuarioId', auth, async (req, res) => {
  try {
    const muestras = await Muestra.find({ usuario: req.params.usuarioId })
      .populate('arbol')
      .sort({ createdAt: -1 });
    res.json(muestras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/muestras - Crear nueva muestra
router.post('/', auth, async (req, res) => {
  try {
    const {
      codigo,
      codigoArbol,
      fecha,
      tipo,
      cantidad,
      condicion,
      imagen,
      observaciones
    } = req.body;

    // Verificar si ya existe el código
    const existeCodigo = await Muestra.findOne({ codigo });
    if (existeCodigo) {
      return res.status(400).json({ message: 'El código de muestra ya existe' });
    }

    // Buscar el árbol
    const arbol = await Arbol.findOne({ codigoArbol });

    const nuevaMuestra = new Muestra({
      codigo,
      codigoArbol,
      fecha,
      tipo,
      cantidad,
      condicion,
      imagen,
      observaciones,
      arbol: arbol ? arbol._id : null,
      usuario: req.user.id
    });

    await nuevaMuestra.save();
    
    const muestraCreada = await Muestra.findById(nuevaMuestra._id)
      .populate('usuario', 'nombre correo')
      .populate('arbol');

    res.status(201).json(muestraCreada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/muestras/:id - Actualizar muestra
router.put('/:id', auth, async (req, res) => {
  try {
    const muestra = await Muestra.findById(req.params.id);
    
    if (!muestra) {
      return res.status(404).json({ message: 'Muestra no encontrada' });
    }

    Object.keys(req.body).forEach(key => {
      muestra[key] = req.body[key];
    });

    await muestra.save();
    
    const muestraActualizada = await Muestra.findById(muestra._id)
      .populate('usuario', 'nombre correo')
      .populate('arbol');

    res.json(muestraActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/muestras/:id - Eliminar muestra
router.delete('/:id', auth, async (req, res) => {
  try {
    const muestra = await Muestra.findById(req.params.id);
    
    if (!muestra) {
      return res.status(404).json({ message: 'Muestra no encontrada' });
    }

    await muestra.deleteOne();
    res.json({ message: 'Muestra eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;