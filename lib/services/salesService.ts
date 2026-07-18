import api from "../api";
import { ENDPOINTS } from "../endpoints";

export const getAllSales = async (): Promise<any> => {
  const res = await api.get(ENDPOINTS.sales.get);
  return res.data;
};

export const createSale = async (payload: {
  customerId: number;
  notes?: string;
  items: { productId: number; quantity: number; price: number }[];
}): Promise<any> => {
  const res = await api.post(ENDPOINTS.sales.create, payload);
  return res.data;
};

export const updateSaleStatus = async (
  id: number,
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED',
  reason?: string,
): Promise<any> => {
  const res = await api.put(ENDPOINTS.sales.updateStatus(id), { status, reason });
  return res.data;
};

export const deleteSale = async (id: number): Promise<any> => {
  const res = await api.delete(ENDPOINTS.sales.delete(id));
  return res.data;
};