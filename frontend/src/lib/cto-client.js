import { createEntityClient } from './entity-client';

const ctoClient = createEntityClient('ctos');

export const getAllCTOs = () => ctoClient.getAll();
export const getCTOById = (id) => ctoClient.getById(id);
export const createCTO = (data) => ctoClient.create(data);
export const updateCTO = (id, data) => ctoClient.update(id, data);
export const deleteCTO = (id) => ctoClient.delete(id); 