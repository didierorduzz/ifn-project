import api from './api';

const subparcelaService = {
  getAll: async () => {
    const response = await api.get('/subparcelas');
    return response.data;
  },

  getByConglomerado: async (codigoCong) => {
    const response = await api.get(`/subparcelas/conglomerado/${codigoCong}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/subparcelas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/subparcelas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/subparcelas/${id}`);
    return response.data;
  }
};

export default subparcelaService;