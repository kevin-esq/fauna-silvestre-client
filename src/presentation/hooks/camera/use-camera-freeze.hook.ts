import { useState, useCallback } from 'react';

export const useCameraFreeze = () => {
  const [freezeUri, setFreezeUri] = useState<string | null>(null);
  const [isShowingFreeze, setIsShowingFreeze] = useState(false);

  const showFreeze = useCallback((photoPath: string) => {
    setFreezeUri(`file://${photoPath}`);
    setIsShowingFreeze(true);
  }, []);

  const hideFreeze = useCallback(() => {
    setIsShowingFreeze(false);
    setTimeout(() => {
      setFreezeUri(null);
    }, 300);
  }, []);

  const clearFreeze = useCallback(() => {
    setFreezeUri(null);
    setIsShowingFreeze(false);
  }, []);

  return {
    freezeUri,
    isShowingFreeze,
    showFreeze,
    hideFreeze,
    clearFreeze
  };
};
