import api from "../api";
import { ENDPOINTS } from "../endpoints";

export interface LoginPayload{
    email:string,
    password:string
}
export interface LoginResponse{
    token:string,
    user:UserType
}
export interface UserType {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export const login=async(payload:LoginPayload):Promise<LoginResponse>=>{
    const res=await api.post(ENDPOINTS.auth.login,payload)
    return res.data
}
export const getMe=async():Promise<UserType>=>{
    const res=await api.get(ENDPOINTS.auth.getMe)
    return res.data
}

export const saveSession=(data:LoginResponse):void=>{
    localStorage.setItem('token',data.token)
    localStorage.setItem('user',JSON.stringify(data.user))
}
 
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
export const getStoredUser = (): UserType | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
 
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
};