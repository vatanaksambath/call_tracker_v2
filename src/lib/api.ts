import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    user_id?: string;
    user_name?: string;
    email?: string;
    avatar?: string;
    exp?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getUserFromToken = (): DecodedToken | null => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: DecodedToken = jwtDecode(token);
            return decodedToken;
        }
        return null;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};

export default api;