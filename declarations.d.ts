declare module 'app.json' {
  export const expo: {
    extra: {
      EXPO_PUBLIC_BASE_URL: string;
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_TIMEOUT: string;
    };
  };
}