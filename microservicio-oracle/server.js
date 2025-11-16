const express = require('express');
const cors = require('cors');
const database = require('./config/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar base de datos
database.initialize();

// Rutas
app.use('/api/zonas', require('./routes/zonas'));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Microservicio Oracle - Zonas',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Microservicio Oracle corriendo en puerto ${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  await database.close();
  process.exit(0);
});