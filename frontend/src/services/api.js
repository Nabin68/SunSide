import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeRoute = async (payload) => {
  const response = await api.post('/routes/analyze', payload);
  return response.data;
};

export const reverseGeocode = async (lat, lon) => {
  const response = await api.get('/routes/reverse-geocode', { params: { lat, lon } });
  return response.data;
};

export const fetchSuggestions = async (query) => {
  const response = await api.get('/routes/geocode', { params: { q: query } });
  return response.data;
};

export const getSunPosition = async (lat, lon, time) => {
  const response = await api.get('/routes/sun-position', { params: { lat, lon, time } });
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default {
  analyzeRoute,
  reverseGeocode,
  fetchSuggestions,
  getSunPosition,
  checkHealth,
};
