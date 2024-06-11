// axios.js
import axios from 'axios';
import router from '../router';

// Create an Axios instance
const api = axios.create({
    baseURL: 'https://api.heartmanagement.fr/api/',
});

export function createAxiosInstance(baseURL) {
    const instance = axios.create({ 
        baseURL,
        // other axios settings if necessary
    });

    instance.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // Redirect to the connexion page if a 401 error is encountered
                router.push({ name: 'Connexion' });
            }
            return Promise.reject(error);
        }
    );
    return instance;
}