const mongoose = require('mongoose');

const muestraSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    match: /^MS-\d{4}$/
  },
  codigoArbol: {
    type: String,
    required: true,
    match: /^AR-\d{4}$/
  },
  fecha: {
    type: Date,
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['Hoja', 'Corteza', 'Suelo', 'Semilla', 'Fruto']
  },
  cantidad: {
    type: Number,
    required: true
  },
  condicion: {
    type: String,
    required: true,
    enum: ['Fresca', 'Seca', 'Preservada']
  },
  imagen: {
    type: String,
    default: ''
  },
  observaciones: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Procesado', 'Rechazado'],
    default: 'Pendiente'
  },
  arbol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arbol'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Muestra', muestraSchema);