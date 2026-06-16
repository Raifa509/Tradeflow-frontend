import api from "../api";
import { ENDPOINTS } from "../endpoints";

export const getAllSuppliers = async (): Promise<any> => {
  const res = await api.get(ENDPOINTS.suppliers.get);
  return res.data;
};

export const createSupplier = async (payload: any): Promise<any> => {
  const res = await api.post(ENDPOINTS.suppliers.create, payload);
  return res.data;
};

export const updateSupplier = async (id: number, payload: any): Promise<any> => {
  const res = await api.put(ENDPOINTS.suppliers.update(id), payload);
  return res.data;
};

export const deleteSupplier = async (id: number): Promise<any> => {
  const res = await api.delete(ENDPOINTS.suppliers.delete(id));
  return res.data;
};