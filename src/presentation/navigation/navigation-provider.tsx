// navigation/navigation-provider.tsx
import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import {
    createNavigationContainerRef,
    StackActions,
    CommonActions,
} from '@react-navigation/native';
import { RootStackParamList } from './navigation.types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

interface NavigationContextType {
    navigate: <T extends keyof RootStackParamList>(
        name: T,
        params?: RootStackParamList[T]
    ) => void;
    goBack: () => void;
    push: <T extends keyof RootStackParamList>(
        name: T,
        params?: RootStackParamList[T]
    ) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
    children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
    const navigate = useCallback(<T extends keyof RootStackParamList>(
        name: T,
        params?: RootStackParamList[T]
    ) => {
        if (navigationRef.isReady()) {
            navigationRef.dispatch(
                CommonActions.navigate({ name, params })
            );
        }
    }, []);

    const goBack = useCallback(() => {
        if (navigationRef.isReady() && navigationRef.canGoBack()) {
            navigationRef.goBack();
        }
    }, []);

    const push = useCallback(<T extends keyof RootStackParamList>(
        name: T,
        params?: RootStackParamList[T]
    ) => {
        if (navigationRef.isReady()) {
            navigationRef.dispatch(StackActions.push(name, params));
        }
    }, []);

    const contextValue = useMemo(() => ({ navigate, goBack, push }), [navigate, goBack, push]);

    return (
        <NavigationContext.Provider value={contextValue}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationActions = (): NavigationContextType => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationActions debe usarse dentro de NavigationProvider');
    }
    return context;
};
