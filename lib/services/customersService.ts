import api from "../api";
import { ENDPOINTS } from "../endpoints";

export interface CustomerType {
    name: string;
    email: string;
    phone: string;
    company: string; 
    address: string;
    isActive?: boolean;
    reason?: string;
}

export const getAllCustomers = async (): Promise<any> => {
    const res = await api.get(ENDPOINTS.customer.get)
    return res.data
}
export const createCustomer = async(payload:CustomerType):Promise<any>=>{
    const res=await api.post(ENDPOINTS.customer.create,payload)
    return res.data
}
export const updateCustomer = async (id: number, payload: Partial<CustomerType>): Promise<any> => {
    const res = await api.patch(ENDPOINTS.customer.update(id), payload);
    return res.data;
};