const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Asignacion = require('../models/Asignacion');
const Conglomerado = require('../models/Conglomerado');
const Subparcela = require('../models/Subparcela');
const axios = require('axios');

const ZONA_SERVICE_URL = process.env.ZONA_SERVICE_URL || 'http://localhost:5002';

// GET /api/asignaciones - Obtener todas las asignaciones (admin)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const asignaciones = await Asignacion.find()
      .populate('brigadista', 'nombre correo zona')
      .populate('conglomerado', 'codigo departamento municipio')
      .populate('subparcela', 'codigoCong numeroSub')
      .populate('asignado_por', 'nombre')
      .sort({ createdAt: -1 });
    
    res.json(asignaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/asignaciones/mis-asignaciones - Obtener asignaciones del brigadista autenticado
router.get('/mis-asignaciones', auth, async (req, res) => {
  try {
    const asignaciones = await Asignacion.find({ brigadista: req.user.id })
      .populate('conglomerado', 'codigo departamento municipio vereda latitud longitud')
      .populate('subparcela', 'codigoCong numeroSub latitud longitud')
      .populate('asignado_por', 'nombre')
      .sort({ fecha_asignacion: -1 });

    // Enriquecer con datos de zonas del microservicio Oracle
    const asignacionesConZonas = await Promise.all(
      asignaciones.map(async (asignacion) => {
        const asignacionObj = asignacion.toObject();
        
        if (asignacion.tipo === 'zona' && asignacion.zona) {
          try {
            const zonaResponse = await axios.get(`${ZONA_SERVICE_URL}/api/zonas/${asignacion.zona}`);
            asignacionObj.zonaData = zonaResponse.data;
          } catch (error) {
            console.error('Error al obtener zona:', error.message);
            asignacionObj.zonaData = null;
          }
        }
        
        return asignacionObj;
      })
    );

    res.json(asignacionesConZonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/asignaciones/brigadista/:id - Obtener asignaciones de un brigadista específico (admin)
router.get('/brigadista/:id', [auth, admin], async (req, res) => {
  try {
    const asignaciones = await Asignacion.find({ brigadista: req.params.id })
      .populate('conglomerado', 'codigo departamento municipio')
      .populate('subparcela', 'codigoCong numeroSub')
      .populate('asignado_por', 'nombre')
      .sort({ fecha_asignacion: -1 });

    res.json(asignaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/asignaciones - Crear nueva asignación (admin)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const {
      brigadista,
      tipo,
      conglomerado,
      subparcela,
      zona,
      estado,
      prioridad,
      fecha_limite,
      brigada,
      notas
    } = req.body;

    // Validar que exista el recurso asignado
    if (tipo === 'conglomerado' && conglomerado) {
      const congExists = await Conglomerado.findById(conglomerado);
      if (!congExists) {
        return res.status(404).json({ message: 'Conglomerado no encontrado' });
      }
    } else if (tipo === 'subparcela' && subparcela) {
      const subExists = await Subparcela.findById(subparcela);
      if (!subExists) {
        return res.status(404).json({ message: 'Subparcela no encontrada' });
      }
    } else if (tipo === 'zona' && zona) {
      // Verificar que la zona exista en el microservicio
      try {
        await axios.get(`${ZONA_SERVICE_URL}/api/zonas/${zona}`);
      } catch (error) {
        return res.status(404).json({ message: 'Zona no encontrada en el microservicio' });
      }
    }

    const nuevaAsignacion = new Asignacion({
      brigadista,
      tipo,
      conglomerado: tipo === 'conglomerado' ? conglomerado : null,
      subparcela: tipo === 'subparcela' ? subparcela : null,
      zona: tipo === 'zona' ? zona : null,
      estado: estado || 'Pendiente',
      prioridad: prioridad || 'Media',
      fecha_limite,
      brigada,
      notas,
      asignado_por: req.user.id
    });

    await nuevaAsignacion.save();

    const asignacionCreada = await Asignacion.findById(nuevaAsignacion._id)
      .populate('brigadista', 'nombre correo')
      .populate('conglomerado', 'codigo departamento municipio')
      .populate('subparcela', 'codigoCong numeroSub')
      .populate('asignado_por', 'nombre');

    res.status(201).json(asignacionCreada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/asignaciones/:id - Actualizar asignación
router.put('/:id', auth, async (req, res) => {
  try {
    const asignacion = await Asignacion.findById(req.params.id);

    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }

    // Solo el brigadista asignado o un admin pueden actualizar
    if (req.user.rol !== 'admin' && asignacion.brigadista.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Actualizar campos permitidos
    const camposPermitidos = ['estado', 'progreso', 'fecha_inicio', 'fecha_finalizacion', 'notas'];
    
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        asignacion[campo] = req.body[campo];
      }
    });

    // Si es admin, puede actualizar más campos
    if (req.user.rol === 'admin') {
      const camposAdmin = ['prioridad', 'fecha_limite', 'brigada'];
      camposAdmin.forEach(campo => {
        if (req.body[campo] !== undefined) {
          asignacion[campo] = req.body[campo];
        }
      });
    }

    await asignacion.save();

    const asignacionActualizada = await Asignacion.findById(asignacion._id)
      .populate('brigadista', 'nombre correo')
      .populate('conglomerado', 'codigo departamento municipio')
      .populate('subparcela', 'codigoCong numeroSub')
      .populate('asignado_por', 'nombre');

    res.json(asignacionActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/asignaciones/:id - Eliminar asignación (admin)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const asignacion = await Asignacion.findById(req.params.id);

    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }

    await asignacion.deleteOne();
    res.json({ message: 'Asignación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/asignaciones/estadisticas/general - Estadísticas generales (admin)
router.get('/estadisticas/general', [auth, admin], async (req, res) => {
  try {
    const total = await Asignacion.countDocuments();
    const porEstado = await Asignacion.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);
    const porTipo = await Asignacion.aggregate([
      { $group: { _id: '$tipo', count: { $sum: 1 } } }
    ]);
    const porPrioridad = await Asignacion.aggregate([
      { $group: { _id: '$prioridad', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      porEstado: porEstado.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      porTipo: porTipo.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      porPrioridad: porPrioridad.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;