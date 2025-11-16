import axios from 'axios';

const ANALISIS_SERVICE_URL = process.env.REACT_APP_ANALISIS_URL || 'http://localhost:5001';

const analisisService = {
  // Análisis de especies
  analizarEspecies: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/analisis/especies`);
    return response.data;
  },

  // Análisis de condición de árboles
  analizarCondicion: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/analisis/condicion-arboles`);
    return response.data;
  },

  // Análisis de muestras
  analizarMuestras: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/analisis/muestras`);
    return response.data;
  },

  // Análisis de DAP y altura
  analizarDapAltura: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/analisis/dap-altura`);
    return response.data;
  },

  // Resumen general
  obtenerResumenGeneral: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/analisis/resumen-general`);
    return response.data;
  },

  // Obtener historial de reportes
  obtenerHistorial: async (tipo = null, limit = 50) => {
    const params = { limit };
    if (tipo) params.tipo = tipo;
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/reportes/historial`, { params });
    return response.data;
  },

  // Descargar PDF de especies
  descargarPDFEspecies: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/reportes/pdf/especies`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar PDF general
  descargarPDFGeneral: async () => {
    const response = await axios.get(`${ANALISIS_SERVICE_URL}/api/reportes/pdf/general`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default analisisService;