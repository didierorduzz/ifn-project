const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado correctamente'))
.catch(err => console.error('❌ Error de conexión MongoDB:', err));

// Rutas (las crearemos después)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conglomerados', require('./routes/conglomerados'));
app.use('/api/subparcelas', require('./routes/subparcelas'));
app.use('/api/arboles', require('./routes/arboles'));
app.use('/api/muestras', require('./routes/muestras'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API IFN funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});