// src/hooks/useSafeRequest.ts
import { useApiStatus } from '@/presentation/contexts/api-status.context';
import { InternalAxiosRequestConfig } from 'axios';
import { ApiService } from '@/services/http/api.service';

export const useSafeRequest = () => {
    const { status } = useApiStatus();
  
    const safeRequest = async <T,>(config: InternalAxiosRequestConfig): Promise<T> => {
      if (status !== 'AUTHENTICATED') {
        throw new Error(`Request blocked - Status: ${status}`);
      }
      const response = await ApiService.getInstance().client.request<T>(config);
      return response.data;
    };
  
    return { safeRequest };
  };