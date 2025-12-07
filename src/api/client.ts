import axios, { type AxiosResponse, type AxiosError } from 'axios';
import CryptoJS from 'crypto-js';

// Define the standard API response structure
export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    timestamp: number;
    data: T;
}

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Generate timestamp (in seconds)
        const ts = Math.floor(Date.now() / 1000);

        // Get configuration from environment
        const appId = import.meta.env.VITE_APP_ID || 'primary';
        const ver = import.meta.env.VITE_APP_VER || 'v1';
        const key = import.meta.env.VITE_API_KEY || '';

        // Generate signature: SHA256(appid + ts + ver + key)
        const inputString = appId + ts + ver + key;
        const signature = CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);

        // Add required headers for signature authentication
        config.headers['APPID'] = appId;
        config.headers['VER'] = ver;
        config.headers['TS'] = ts.toString();
        config.headers['SIG'] = signature;

        // Get token from localStorage for authenticated requests
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Add token to XAUTH header as expected by backend
            config.headers['XAUTH'] = token;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const res = response.data;

        // Check if the custom code indicates success (0)
        if (res.code !== 0) {
            // You might want to handle specific error codes here
            // For now, reject with the message from backend
            return Promise.reject(new Error(res.msg || 'Error'));
        }

        return response;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default api;
