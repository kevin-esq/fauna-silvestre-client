// src/app/app.tsx
import React from 'react';
import { AuthProvider } from '../presentation/contexts/auth-context';
import AppNavigator from '../presentation/navigation/app-navigator';
import { NavigationProvider, navigationRef } from '../presentation/navigation/navigation-provider';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../presentation/contexts/theme-context';
import { PublicationProvider } from '../presentation/contexts/publication-context';
import { LoadingProvider } from '../presentation/contexts/loading-context';

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AuthProvider>
        <NavigationProvider>
          <ThemeProvider>
            <LoadingProvider>
              <PublicationProvider>
                <AppNavigator />
              </PublicationProvider>
            </LoadingProvider>
          </ThemeProvider>
        </NavigationProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}