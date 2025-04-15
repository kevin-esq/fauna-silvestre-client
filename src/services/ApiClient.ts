import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import { clearToken } from '../utils/tokenStorage';
//import { useAuthContext } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'https://c119-201-108-113-150.ngrok-free.app/api',
  timeout: 10000,
});

//const { token } = useAuthContext();

api.interceptors.request.use(async (config) => {
 /* if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }*/
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
        clearToken();
        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    return Promise.reject(error);
  }
);

export default api;