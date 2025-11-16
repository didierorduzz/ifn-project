import api from './api';

const asignacionService = {
  // Obtener todas las asignaciones (admin)
  getAll: async () => {
    const response = await api.get('/asignaciones');
    return response.data;
  },

  // Obtener mis asignaciones (brigadista)
  getMisAsignaciones: async () => {
    const response = await api.get('/asignaciones/mis-asignaciones');
    return response.data;
  },

  // Obtener asignaciones de un brigadista específico (admin)
  getByBrigadista: async (brigadistaId) => {
    const response = await api.get(`/asignaciones/brigadista/${brigadistaId}`);
    return response.data;
  },

  // Crear asignación (admin)
  create: async (data) => {
    const response = await api.post('/asignaciones', data);
    return response.data;
  },

  // Actualizar asignación
  update: async (id, data) => {
    const response = await api.put(`/asignaciones/${id}`, data);
    return response.data;
  },

  // Eliminar asignación (admin)
  delete: async (id) => {
    const response = await api.delete(`/asignaciones/${id}`);
    return response.data;
  },

  // Obtener estadísticas (admin)
  getEstadisticas: async () => {
    const response = await api.get('/asignaciones/estadisticas/general');
    return response.data;
  }
};

export default asignacionService;