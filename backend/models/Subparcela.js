const mongoose = require('mongoose');

const subparcelaSchema = new mongoose.Schema({
  codigoCong: {
    type: String,
    required: true,
    match: /^CG-\d{4}$/
  },
  numeroSub: {
    type: String,
    required: true
  },
  latitud: {
    type: Number,
    required: true
  },
  longitud: {
    type: Number,
    required: true
  },
  altitud: {
    type: Number,
    required: true
  },
  pendiente: {
    type: Number,
    required: true
  },
  exposicion: {
    type: Number,
    required: true
  },
  cobertura: {
    type: String,
    required: true
  },
  observaciones: {
    type: String,
    default: ''
  },
  conglomerado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conglomerado'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subparcela', subparcelaSchema);