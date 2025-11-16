import api from './api';

const muestraService = {
  getAll: async () => {
    const response = await api.get('/muestras');
    return response.data;
  },

  getByArbol: async (codigoArbol) => {
    const response = await api.get(`/muestras/arbol/${codigoArbol}`);
    return response.data;
  },

  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/muestras/usuario/${usuarioId}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/muestras', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/muestras/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/muestras/${id}`);
    return response.data;
  }
};

export default muestraService;