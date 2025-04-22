// types/expo-file-system.d.ts
declare module 'expo-file-system' {
    interface FileSystemFileInfo {
      extra?: {
        metadata?: Record<string, any>;
      };
    }
  }