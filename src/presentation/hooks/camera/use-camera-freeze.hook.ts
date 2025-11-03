import { useState, useCallback } from 'react';
import { useToggle } from '../common/use-toggle.hook';

export const useCameraFreeze = () => {
  const [freezeUri, setFreezeUri] = useState<string | null>(null);
  const { value: isShowingFreeze, setTrue: setShowingFreeze, setFalse: clearShowingFreeze } = useToggle(false);

  const showFreeze = useCallback((photoPath: string) => {
    setFreezeUri(`file://${photoPath}`);
    setShowingFreeze();
  }, [setShowingFreeze]);

  const hideFreeze = useCallback(() => {
    clearShowingFreeze();
    setTimeout(() => {
      setFreezeUri(null);
    }, 300);
  }, [clearShowingFreeze]);

  const clearFreeze = useCallback(() => {
    setFreezeUri(null);
    clearShowingFreeze();
  }, [clearShowingFreeze]);

  return {
    freezeUri,
    isShowingFreeze,
    showFreeze,
    hideFreeze,
    clearFreeze
  };
};
