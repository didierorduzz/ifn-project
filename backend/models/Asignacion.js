const mongoose = require('mongoose');

const asignacionSchema = new mongoose.Schema({
  brigadista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  tipo: {
    type: String,
    enum: ['conglomerado', 'subparcela', 'zona'],
    required: true
  },
  // Referencias según el tipo
  conglomerado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conglomerado'
  },
  subparcela: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subparcela'
  },
  zona: {
    type: String // ID de zona del microservicio Oracle
  },
  // Información de la asignación
  estado: {
    type: String,
    enum: ['Pendiente', 'En Proceso', 'Completado', 'Pausado'],
    default: 'Pendiente'
  },
  prioridad: {
    type: String,
    enum: ['Alta', 'Media', 'Baja'],
    default: 'Media'
  },
  fecha_asignacion: {
    type: Date,
    default: Date.now
  },
  fecha_inicio: {
    type: Date
  },
  fecha_finalizacion: {
    type: Date
  },
  fecha_limite: {
    type: Date
  },
  progreso: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  brigada: {
    type: String,
    default: ''
  },
  notas: {
    type: String,
    default: ''
  },
  asignado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
});

// Índices para mejorar consultas
asignacionSchema.index({ brigadista: 1, estado: 1 });
asignacionSchema.index({ tipo: 1, estado: 1 });

module.exports = mongoose.model('Asignacion', asignacionSchema);