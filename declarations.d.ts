declare module '*.png' {
  const value: number;
  export default value;
}

declare module 'app.json' {
  export const expo: {
    extra: {
      PUBLIC_BASE_URL: string;
      PUBLIC_API_URL: string;
      PUBLIC_API_TIMEOUT: string;
    };
  };
}
