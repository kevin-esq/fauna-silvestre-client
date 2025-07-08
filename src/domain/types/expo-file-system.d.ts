declare module 'expo-file-system' {
    interface FileSystemFileInfo {
      extra?: {
        metadata?: Record<string, any>;
      };
    }
  }