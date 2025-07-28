// TopTabsNavigationBar.tsx
import React, { useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import favicon from '../../../assets/favicon.png';
import { Theme } from '../../contexts/theme-context';
import { themeVariables } from '../../contexts/theme-context';

export default function TopTabsNavigationBar({
  state,
  descriptors,
  navigation,
  theme,
}: MaterialTopTabBarProps & { theme: Theme }): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const position = useSharedValue(state.index);

  const { tabWidth, availableWidth } = useMemo(() => {
    const horizontalInsets = insets.left + insets.right;
    const availableWidth = screenWidth - horizontalInsets;
    return {
      tabWidth: availableWidth / state.routes.length,
      availableWidth,
    };
  }, [screenWidth, insets.left, insets.right, state.routes.length]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(position.value * tabWidth) }],
  }));

  useEffect(() => {
    position.value = state.index;
  }, [state.index, position]);

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(insets, variables), [insets, variables]);



  return (
    <View style={styles.container}>
      <View style={styles.headerOuter}>
        <Image source={favicon} style={styles.headerIcon} />
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerText}>
          Fauna Silvestre
        </Text>
      </View>

      <View style={[styles.tabsContainer, { width: availableWidth }]}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const { tabBarIcon } = descriptor.options;
          const isFocused = state.index === index;

          const onPress = (): void => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, { width: tabWidth }]}
              activeOpacity={0.7}
              testID={`tab-${route.name}`}
            >
              {tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? styles.activeLabel.color : styles.label.color,
              })}
            </TouchableOpacity>
          );
        })}

        <Animated.View
          style={[styles.indicator, { width: tabWidth }, animatedIndicatorStyle]}
        />
      </View>
    </View>
  );
}

const createStyles = (insets: { top: number; left: number; right: number }, variables: ReturnType<typeof themeVariables>) =>
  StyleSheet.create({
    container: {
      paddingTop: insets.top,
      paddingHorizontal: 16,
      backgroundColor: variables['--background'],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: variables['--border'],
    },
    headerOuter: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    headerIcon: {
      width: 32,
      height: 32,
      marginRight: 12,
    },
    headerText: {
      fontSize: 26,
      fontWeight: 'bold',
      color: variables['--primary'],
      flexShrink: 1,
    },
    tabsContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
    },
    tabButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    label: {
      fontSize: 14,
      color: variables['--text-secondary'],
      fontWeight: '600',
    },
    activeLabel: {
      color: variables['--primary'],
      fontWeight: 'bold',
    },
    indicator: {
      position: 'absolute',
      height: 4,
      backgroundColor: variables['--primary'],
      bottom: -1,
    },
  });
