import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token: string) => {
  console.log('token save', token);
  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.setItemAsync('userToken', token);
};

export const getToken = async (): Promise<string | null> => {
  console.log('token get' + (await SecureStore.getItemAsync('userToken')));
  return (await SecureStore.getItemAsync('userToken'));
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync('userToken');
};
