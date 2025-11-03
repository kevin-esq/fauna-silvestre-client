import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ConsoleLogger } from '@/services/logging/console-logger';

const logger = new ConsoleLogger('info');

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOffline: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isOffline: false
  });

  useEffect(() => {
    let previousIsConnected: boolean | null = null;

    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      const isOffline = !isConnected || isInternetReachable === false;

      const status: NetworkStatus = {
        isConnected,
        isInternetReachable,
        type: state.type,
        isOffline
      };

      setNetworkStatus(status);

      // Only log when connection status actually changes
      if (previousIsConnected !== null && previousIsConnected !== isConnected) {
        logger.info(
          `Network status changed: ${status.isConnected ? 'Online' : 'Offline'}`
        );
      }
      previousIsConnected = isConnected;
    });

    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      const isOffline = !isConnected || isInternetReachable === false;

      setNetworkStatus({
        isConnected,
        isInternetReachable,
        type: state.type,
        isOffline
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      logger.error('Error checking connection', error as Error);
      return false;
    }
  }, []);

  return {
    ...networkStatus,
    checkConnection
  };
};
