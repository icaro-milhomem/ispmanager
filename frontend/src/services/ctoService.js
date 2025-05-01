import { createEntityClient } from './api';

const ctoClient = createEntityClient('ctos');

export const ctoService = {
  updatePosition: async (id, position) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Atualizando posição da CTO:', id, position);
      const response = await ctoClient.put(`/${id}/position`, {
        latitude: position.lat,
        longitude: position.lng
      });
      
      if (!response.data) {
        throw new Error('Resposta inválida do servidor');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar posição da CTO:', error);
      if (error.response?.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      throw error;
    }
  }
}; 