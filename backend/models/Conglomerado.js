const mongoose = require('mongoose');

const conglomeradoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    match: /^CG-\d{4}$/
  },
  departamento: {
    type: String,
    required: true
  },
  municipio: {
    type: String,
    required: true
  },
  vereda: {
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
  datum: {
    type: String,
    required: true
  },
  zonaUTM: {
    type: String,
    required: true
  },
  precision: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  observaciones: {
    type: String,
    default: ''
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conglomerado', conglomeradoSchema);