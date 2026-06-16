import axios from 'axios';
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

//attach token to every request automatically
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the user is currently on the root login page '/'
    const isAtLoginLocation = window.location.pathname === '/';

    if (error.response?.status === 401 && !isAtLoginLocation) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';  
    }
    
    return Promise.reject(error);
  }
)
export default api;