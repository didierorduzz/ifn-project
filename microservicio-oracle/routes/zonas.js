const express = require('express');
const router = express.Router();
const Zona = require('../models/Zona');

// GET /api/zonas - Obtener todas las zonas
router.get('/', async (req, res) => {
  try {
    const zonas = await Zona.obtenerTodas();
    res.json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/zonas/:id - Obtener una zona por ID
router.get('/:id', async (req, res) => {
  try {
    const zona = await Zona.obtenerPorId(req.params.id);
    if (!zona) {
      return res.status(404).json({ message: 'Zona no encontrada' });
    }
    res.json(zona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/zonas - Crear nueva zona
router.post('/', async (req, res) => {
  try {
    const nuevaZona = await Zona.crear(req.body);
    res.status(201).json(nuevaZona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/zonas/:id - Actualizar zona
router.put('/:id', async (req, res) => {
  try {
    const zonaActualizada = await Zona.actualizar(req.params.id, req.body);
    res.json(zonaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/zonas/:id - Eliminar zona
router.delete('/:id', async (req, res) => {
  try {
    await Zona.eliminar(req.params.id);
    res.json({ message: 'Zona eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;