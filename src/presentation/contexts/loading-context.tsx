import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { LoadingModal } from '../components/common/loading-modal.component';
import { useTheme } from '../contexts/theme-context';

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  const value = useMemo(() => ({
    isLoading,
    showLoading,
    hideLoading,
  }), [isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingModal visible={isLoading} theme={theme} />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
