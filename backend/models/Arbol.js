const mongoose = require('mongoose');

const arbolSchema = new mongoose.Schema({
  codigoSubparcela: {
    type: String,
    required: true,
    match: /^SP-\d{4}$/
  },
  codigoArbol: {
    type: String,
    required: true,
    unique: true,
    match: /^AR-\d{4}$/
  },
  numIndividuo: {
    type: Number,
    required: true
  },
  especie: {
    type: String,
    required: true
  },
  dap: {
    type: Number,
    required: true
  },
  altura: {
    type: Number,
    required: true
  },
  alturaCom: {
    type: Number,
    default: 0
  },
  condicion: {
    type: String,
    required: true,
    enum: ['Vivo', 'Muerto en pie', 'Tumbado', 'Cepa']
  },
  sanitario: {
    type: String,
    default: ''
  },
  observaciones: {
    type: String,
    default: ''
  },
  subparcela: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subparcela'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Arbol', arbolSchema);