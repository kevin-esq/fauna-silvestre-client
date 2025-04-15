import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync('userToken', token);
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('userToken');
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync('userToken');
};
