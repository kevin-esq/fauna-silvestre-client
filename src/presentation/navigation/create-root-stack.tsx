import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation.types';
import { ScreenStackProps } from 'react-native-screens';
import { ParamListBase } from '@react-navigation/native';

export function createRootStack<ParamList extends ParamListBase>(
  screens: Array<{ name: keyof ParamList; component: React.ComponentType<ScreenStackProps> }>
) {
  const Stack = createNativeStackNavigator<RootStackParamList>();

  return function RootStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {screens.map(({ name, component }) => (
          <Stack.Screen key={String(name)} name={name as keyof RootStackParamList} component={component} />
        ))}
      </Stack.Navigator>
    );
  };
}
