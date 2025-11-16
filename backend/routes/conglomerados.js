const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conglomerado = require('../models/Conglomerado');

// GET /api/conglomerados - Obtener todos los conglomerados
router.get('/', auth, async (req, res) => {
  try {
    const conglomerados = await Conglomerado.find()
      .populate('usuario', 'nombre correo')
      .sort({ createdAt: -1 });
    res.json(conglomerados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/conglomerados/:id - Obtener un conglomerado por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const conglomerado = await Conglomerado.findById(req.params.id)
      .populate('usuario', 'nombre correo');
    
    if (!conglomerado) {
      return res.status(404).json({ message: 'Conglomerado no encontrado' });
    }
    
    res.json(conglomerado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/conglomerados - Crear nuevo conglomerado
router.post('/', auth, async (req, res) => {
  try {
    const {
      codigo,
      departamento,
      municipio,
      vereda,
      latitud,
      longitud,
      datum,
      zonaUTM,
      precision,
      fecha,
      observaciones
    } = req.body;

    // Verificar si ya existe el código
    const existeCodigo = await Conglomerado.findOne({ codigo });
    if (existeCodigo) {
      return res.status(400).json({ message: 'El código ya existe' });
    }

    const nuevoConglomerado = new Conglomerado({
      codigo,
      departamento,
      municipio,
      vereda,
      latitud,
      longitud,
      datum,
      zonaUTM,
      precision,
      fecha,
      observaciones,
      usuario: req.user.id
    });

    await nuevoConglomerado.save();
    
    const conglomeradoCreado = await Conglomerado.findById(nuevoConglomerado._id)
      .populate('usuario', 'nombre correo');

    res.status(201).json(conglomeradoCreado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/conglomerados/:id - Actualizar conglomerado
router.put('/:id', auth, async (req, res) => {
  try {
    const conglomerado = await Conglomerado.findById(req.params.id);
    
    if (!conglomerado) {
      return res.status(404).json({ message: 'Conglomerado no encontrado' });
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      conglomerado[key] = req.body[key];
    });

    await conglomerado.save();
    
    const conglomeradoActualizado = await Conglomerado.findById(conglomerado._id)
      .populate('usuario', 'nombre correo');

    res.json(conglomeradoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/conglomerados/:id - Eliminar conglomerado
router.delete('/:id', auth, async (req, res) => {
  try {
    const conglomerado = await Conglomerado.findById(req.params.id);
    
    if (!conglomerado) {
      return res.status(404).json({ message: 'Conglomerado no encontrado' });
    }

    await conglomerado.deleteOne();
    res.json({ message: 'Conglomerado eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;