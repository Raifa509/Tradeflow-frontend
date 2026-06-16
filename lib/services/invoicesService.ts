import api from "../api"
import { ENDPOINTS } from "../endpoints"

export const getAllInvoices = async (): Promise<any> => {
  const res = await api.get(ENDPOINTS.invoices.get);
  return res.data;
};

export const markInvoicePaid = async (id: number): Promise<any> => {
  const res = await api.put(ENDPOINTS.invoices.markPaid(id));
  return res.data;
};