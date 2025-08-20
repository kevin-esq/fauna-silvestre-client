import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
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
import favicon from '@/assets/favicon.png';
import { Theme } from '@/presentation/contexts/theme.context';
import { themeVariables } from '@/presentation/contexts/theme.context';
import { createStyles } from './top-tabs-navigation-bar.component.styles';

type TabButtonProps = {
  routeKey: string;
  routeName: string;
  isFocused: boolean;
  tabBarIcon?: MaterialTopTabBarProps['descriptors'][string]['options']['tabBarIcon'];
  onPress: (routeKey: string, routeName: string) => void;
  tabWidth: number;
  activeColor: string;
  inactiveColor: string;
  styles: ReturnType<typeof createStyles>;
};

const TabButton = React.memo(({
  routeKey,
  routeName,
  isFocused,
  tabBarIcon,
  onPress,
  tabWidth,
  activeColor,
  inactiveColor,
  styles,
}: TabButtonProps) => {
  const handlePress = useCallback(() => {
    onPress(routeKey, routeName);
  }, [onPress, routeKey, routeName]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.tabButton, { width: tabWidth }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={`${routeName} tab`}
      testID={`tab-${routeName}`}
    >
      {tabBarIcon?.({
        focused: isFocused,
        color: isFocused ? activeColor : inactiveColor,
      })}
    </TouchableOpacity>
  );
});

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

  const variables = useMemo(() => themeVariables(theme), [theme]);
  const styles = useMemo(() => createStyles(insets, variables), [insets, variables]);

  position.value = state.index;

  const currentRouteRef = useRef(state.routes[state.index].key);

  useEffect(() => {
    currentRouteRef.current = state.routes[state.index].key;
  }, [state.index, state.routes]);

  const handleTabPress = useCallback((routeKey: string, routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    
    if (currentRouteRef.current !== routeKey && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }, [navigation]);

  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.headerOuter}>
        <Image 
          source={favicon} 
          style={styles.headerIcon} 
          accessibilityIgnoresInvertColors
          accessibilityLabel="App logo"
        />
        <Text 
          numberOfLines={1} 
          ellipsizeMode="tail" 
          style={styles.headerText}
          accessibilityRole="text"
        >
          k'aaxil ba'alilche'
        </Text>
      </View>

      <View style={[styles.tabsContainer, { width: availableWidth }]}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const isFocused = state.index === index;

          return (
            <TabButton
              key={route.key}
              routeKey={route.key}
              routeName={route.name}
              isFocused={isFocused}
              tabBarIcon={descriptor.options.tabBarIcon}
              onPress={handleTabPress}
              tabWidth={tabWidth}
              activeColor={variables['--primary']}
              inactiveColor={variables['--text-secondary']}
              styles={styles}
            />
          );
        })}

        <Animated.View
          style={[
            styles.indicator, 
            { 
              width: tabWidth,
              backgroundColor: variables['--primary'],
            }, 
            animatedIndicatorStyle
          ]}
        />
      </View>
    </View>
  );
}