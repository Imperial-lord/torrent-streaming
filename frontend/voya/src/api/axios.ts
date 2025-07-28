import axios from 'axios';
import { getAuthHeader, clearCreds } from '../utils/auth';
import { redirectToLogin } from '../utils/redirect';

const instance = axios.create({
    baseURL: 'https://8996e90f6735.ngrok-free.app',
    withCredentials: true,
});

instance.interceptors.request.use(config => {
    const headers = getAuthHeader();
    config.headers = {
        ...config.headers,
        ...headers,
    };
    return config;
});

instance.interceptors.response.use(
    res => res,
    error => {
        if (error.response?.status === 401) {
            clearCreds();
            redirectToLogin();
        }
        return Promise.reject(error);
    }
);

export default instance;