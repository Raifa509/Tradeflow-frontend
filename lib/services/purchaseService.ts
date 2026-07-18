import api from "../api";
import { ENDPOINTS } from "../endpoints";

export const getAllPurchases = async (): Promise<any> => {
  const res = await api.get(ENDPOINTS.purchases.get);
  return res.data;
};

export const createPurchase = async (payload: {
  supplierId: number;
  notes?: string;
  items: { productId: number; quantity: number; price: number }[];
}): Promise<any> => {
  const res = await api.post(ENDPOINTS.purchases.create, payload);
  return res.data;
};

export const updatePurchaseStatus = async (
  id: number,
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED',
  reason?: string
): Promise<any> => {
  const res = await api.put(ENDPOINTS.purchases.updateStatus(id), { status, reason });
  return res.data;
};

export const deletePurchase = async (id: number): Promise<any> => {
  const res = await api.delete(ENDPOINTS.purchases.delete(id));
  return res.data;
};