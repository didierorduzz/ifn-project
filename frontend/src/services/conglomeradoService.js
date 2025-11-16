import api from './api';

const conglomeradoService = {
  // Obtener todos los conglomerados
  getAll: async () => {
    const response = await api.get('/conglomerados');
    return response.data;
  },

  // Obtener un conglomerado por ID
  getById: async (id) => {
    const response = await api.get(`/conglomerados/${id}`);
    return response.data;
  },

  // Crear conglomerado
  create: async (data) => {
    const response = await api.post('/conglomerados', data);
    return response.data;
  },

  // Actualizar conglomerado
  update: async (id, data) => {
    const response = await api.put(`/conglomerados/${id}`, data);
    return response.data;
  },

  // Eliminar conglomerado
  delete: async (id) => {
    const response = await api.delete(`/conglomerados/${id}`);
    return response.data;
  }
};

export default conglomeradoService;