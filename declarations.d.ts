declare module '*.png' {
  const value: number;
  export default value;
}
declare module '*.jpg' {
  const value: number;
  export default value;
}
declare module '*.jpeg' {
  const value: number;
  export default value;
}
declare module '*.gif' {
  const value: number;
  export default value;
}
declare module '*.webp' {
  const value: number;
  export default value;
}
declare module '*.svg' {
  const value: number;
  export default value;
}
declare module '*.bmp' {
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
