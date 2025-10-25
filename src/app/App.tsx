import React from 'react';
import { AuthProvider } from '../presentation/contexts/auth.context';
import AppNavigator from '../presentation/navigation/app.navigator';
import {
  NavigationProvider,
  navigationRef
} from '../presentation/navigation/navigation-provider';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../presentation/contexts/theme.context';
import { PublicationProvider } from '../presentation/contexts/publication.context';
import { NotificationProvider } from '../presentation/contexts/notification.context';
import { LoadingProvider } from '../presentation/contexts/loading.context';
import { CatalogProvider } from '../presentation/contexts/catalog.context';
import { DraftProvider } from '../presentation/contexts/draft.context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APIStatusProvider } from '../presentation/contexts/api-status.context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <APIStatusProvider>
          <AuthProvider>
            <NavigationProvider>
              <ThemeProvider>
                <LoadingProvider>
                  <CatalogProvider>
                    <DraftProvider>
                      <PublicationProvider>
                        <NotificationProvider>
                          <AppNavigator />
                        </NotificationProvider>
                      </PublicationProvider>
                    </DraftProvider>
                  </CatalogProvider>
                </LoadingProvider>
              </ThemeProvider>
            </NavigationProvider>
          </AuthProvider>
        </APIStatusProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
