import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../../presentation/navigation/navigationRef';
import { clearToken, getToken } from '../../shared/utils/tokenStorage';
//import { useAuthContext } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'https://43fa-187-150-194-135.ngrok-free.app/api',
  timeout: 10000,
});

//const { token } = useAuthContext();
var token = (SecureStore.getItem('userToken'));

api.interceptors.request.use(async (config) => {
  console.log('token in interceptor = ', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
        clearToken().then(r => console.log(r));
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