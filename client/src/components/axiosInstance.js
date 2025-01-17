import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001', // Use an environment variable or fallback to localhost
});

export default axiosInstance;
