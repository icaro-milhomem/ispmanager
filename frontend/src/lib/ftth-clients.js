import { createEntityClient } from '@/api/apiClient';

// Cliente para CTOs
export const ctoClient = createEntityClient('ctos');

// Cliente para conexões FTTH
export const ftthConnectionsClient = createEntityClient('ftth/connections');

// Exportar clientes
export default {
  ctoClient,
  ftthConnectionsClient
}; 