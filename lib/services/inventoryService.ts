import api from "../api";
import { ENDPOINTS } from "../endpoints";

export const getAllProducts = async (): Promise<any> => {
  const res = await api.get(ENDPOINTS.inventory.get);
  return res.data;
};

export const createProduct = async (payload: any): Promise<any> => {
  const res = await api.post(ENDPOINTS.inventory.create, payload);
  return res.data;
};

export const updateProduct = async (id: number, payload: any): Promise<any> => {
  const res = await api.put(ENDPOINTS.inventory.update(id), payload);
  return res.data;
};