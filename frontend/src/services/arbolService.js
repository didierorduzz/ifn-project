import api from './api';

const arbolService = {
  getAll: async () => {
    const response = await api.get('/arboles');
    return response.data;
  },

  getBySubparcela: async (codigoSub) => {
    const response = await api.get(`/arboles/subparcela/${codigoSub}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/arboles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/arboles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/arboles/${id}`);
    return response.data;
  }
};

export default arbolService;