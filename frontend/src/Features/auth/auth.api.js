import { apiClient } from '../../services/apiClient';

export const loginUser = (payload) => apiClient.post('/auth/login', payload);
export const registerUser = (payload) => apiClient.post('/auth/signup', payload);
export const fetchCurrentUser = () => apiClient.get('/auth/me');
export const logoutUser = () => apiClient.post('/auth/logout', {});
