import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  Image,
  Animated as RNAnimated,
  Platform,
  Easing
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import favicon from '@/assets/favicon.png';
import { Theme, useTheme } from '@/presentation/contexts/theme.context';
import { createStyles } from './top-tabs-navigation-bar.styles';
import { useNavigationActions } from '@/presentation/navigation/navigation-provider';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

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

const TabButton = React.memo(
  ({
    routeKey,
    routeName,
    isFocused,
    tabBarIcon,
    onPress,
    tabWidth,
    activeColor,
    inactiveColor,
    styles
  }: TabButtonProps) => {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;
    const opacityAnim = useRef(
      new RNAnimated.Value(isFocused ? 1 : 0.7)
    ).current;
    const bgOpacityAnim = useRef(
      new RNAnimated.Value(isFocused ? 1 : 0)
    ).current;

    useEffect(() => {
      RNAnimated.parallel([
        RNAnimated.timing(opacityAnim, {
          toValue: isFocused ? 1 : 0.7,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        RNAnimated.spring(bgOpacityAnim, {
          toValue: isFocused ? 1 : 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    }, [isFocused, opacityAnim, bgOpacityAnim]);

    const handlePressIn = () => {
      RNAnimated.spring(scaleAnim, {
        toValue: 0.92,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }).start();
    };

    const handlePressOut = () => {
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true
      }).start();
    };

    const handlePress = useCallback(() => {
      onPress(routeKey, routeName);
    }, [onPress, routeKey, routeName]);

    return (
      <RNAnimated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.tabButton, { width: tabWidth }]}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityState={{ selected: isFocused }}
          accessibilityLabel={`${routeName} tab`}
          testID={`tab-${routeName}`}
        >
          <RNAnimated.View
            style={[styles.tabButtonBackground, { opacity: bgOpacityAnim }]}
          />

          <View style={styles.tabIconContainer}>
            {tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? activeColor : inactiveColor
            })}
          </View>
        </TouchableOpacity>
      </RNAnimated.View>
    );
  }
);

TabButton.displayName = 'TabButton';

const NotificationButton = React.memo(
  ({
    onPress,
    notificationCount,
    theme
  }: {
    onPress: () => void;
    notificationCount: number;
    theme: Theme;
  }) => {
    const { colors, spacing, borderRadius, iconSizes } = theme;
    const pulseAnim = useRef(new RNAnimated.Value(1)).current;
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;

    useEffect(() => {
      if (notificationCount > 0) {
        const animation = RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            }),
            RNAnimated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            })
          ])
        );
        animation.start();
        return () => animation.stop();
      } else {
        pulseAnim.setValue(1);
      }
    }, [notificationCount, pulseAnim]);

    const handlePressIn = () => {
      RNAnimated.spring(scaleAnim, {
        toValue: 0.88,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }).start();
    };

    const handlePressOut = () => {
      RNAnimated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true
      }).start();
    };

    const buttonStyle = useMemo(
      () => ({
        width: iconSizes.large + spacing.small + spacing.tiny,
        height: iconSizes.large + spacing.small + spacing.tiny,
        borderRadius: (iconSizes.large + spacing.small + spacing.tiny) / 2,
        backgroundColor: colors.surfaceVariant,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        position: 'relative' as const,
        ...Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4
          },
          android: {
            elevation: 3
          }
        })
      }),
      [iconSizes, spacing, colors]
    );

    const badgeStyle = useMemo(
      () => ({
        position: 'absolute' as const,
        top: -spacing.tiny / 2,
        right: -spacing.tiny / 2,
        minWidth: iconSizes.small + spacing.tiny,
        height: iconSizes.small + spacing.tiny,
        borderRadius: (iconSizes.small + spacing.tiny) / 2,
        backgroundColor: colors.secondary,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingHorizontal: spacing.tiny + 1,
        borderWidth: borderRadius.small / 2,
        borderColor: colors.surface,
        ...Platform.select({
          ios: {
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4
          },
          android: {
            elevation: 4
          }
        })
      }),
      [spacing, iconSizes, borderRadius, colors]
    );

    return (
      <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={buttonStyle}
          activeOpacity={1}
          accessibilityLabel={`Notificaciones${notificationCount > 0 ? `, ${notificationCount} sin leer` : ''}`}
          accessibilityRole="button"
        >
          <FontAwesome5Icon
            name="bell"
            size={iconSizes.medium - 4}
            color={
              notificationCount > 0 ? colors.primary : colors.textSecondary
            }
            solid={notificationCount > 0}
          />

          {notificationCount > 0 && (
            <RNAnimated.View
              style={[badgeStyle, { transform: [{ scale: pulseAnim }] }]}
            >
              <Text
                style={{
                  color: colors.textOnSecondary,
                  fontSize: theme.typography.fontSize.small - 2,
                  fontWeight: theme.typography.fontWeight.black,
                  letterSpacing: -0.2
                }}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </RNAnimated.View>
          )}
        </TouchableOpacity>
      </RNAnimated.View>
    );
  }
);

NotificationButton.displayName = 'NotificationButton';

const CreatePostButton = React.memo(
  ({ onPress, theme }: { onPress: () => void; theme: Theme }) => {
    const { colors, spacing, iconSizes } = theme;
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;
    const rotateAnim = useRef(new RNAnimated.Value(0)).current;

    const handlePressIn = () => {
      RNAnimated.parallel([
        RNAnimated.spring(scaleAnim, {
          toValue: 0.85,
          tension: 100,
          friction: 8,
          useNativeDriver: true
        }),
        RNAnimated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();
    };

    const handlePressOut = () => {
      RNAnimated.parallel([
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true
        }),
        RNAnimated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();
    };

    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg']
    });

    const buttonStyle = useMemo(
      () => ({
        width: iconSizes.xlarge + spacing.tiny,
        height: iconSizes.xlarge + spacing.tiny,
        borderRadius: (iconSizes.xlarge + spacing.tiny) / 2,
        backgroundColor: colors.primary,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
          },
          android: {
            elevation: 6
          }
        })
      }),
      [iconSizes, spacing, colors]
    );

    return (
      <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={buttonStyle}
          activeOpacity={1}
          accessibilityLabel="Crear nueva publicación"
          accessibilityRole="button"
        >
          <RNAnimated.View style={{ transform: [{ rotate: rotation }] }}>
            <FontAwesome5Icon
              name="plus"
              size={iconSizes.medium}
              color={colors.textOnPrimary}
            />
          </RNAnimated.View>
        </TouchableOpacity>
      </RNAnimated.View>
    );
  }
);

CreatePostButton.displayName = 'CreatePostButton';

export default function TopTabsNavigationBar({
  state,
  descriptors,
  navigation
}: MaterialTopTabBarProps): React.JSX.Element {
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const position = useSharedValue(state.index);
  const [notificationCount, setNotificationCount] = useState(3);
  const { navigateAndReset } = useNavigationActions();

  const { tabWidth, availableWidth, indicatorWidth } = useMemo(() => {
    const horizontalInsets = insets.left + insets.right;
    const availableWidth =
      screenWidth - horizontalInsets - theme.spacing.medium * 2;
    const tabWidth =
      (availableWidth - (theme.spacing.small + theme.spacing.tiny)) /
      state.routes.length;

    const indicatorWidth = tabWidth * 0.4;

    return {
      tabWidth,
      availableWidth,
      indicatorWidth
    };
  }, [
    screenWidth,
    insets.left,
    insets.right,
    state.routes.length,
    theme.spacing
  ]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX =
      position.value * tabWidth +
      (tabWidth - indicatorWidth) / 2 +
      theme.spacing.tiny +
      2;

    return {
      transform: [
        {
          translateX: withSpring(translateX, {
            damping: 20,
            stiffness: 200,
            mass: 0.5,
            overshootClamping: false
          })
        }
      ],
      width: indicatorWidth
    };
  }, [tabWidth, indicatorWidth, theme.spacing]);

  const styles = useMemo(() => createStyles(insets, theme), [insets, theme]);

  const currentRouteRef = useRef(state.routes[state.index].key);

  useEffect(() => {
    position.value = state.index;
    currentRouteRef.current = state.routes[state.index].key;
  }, [state, position]);

  const handleTabPress = useCallback(
    (routeKey: string, routeName: string) => {
      if (currentRouteRef.current === routeKey) return;

      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true
      });

      if (!event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  const handleCreatePost = useCallback(() => {
    console.log('Crear nueva publicación');
    navigateAndReset('AddPublication');
  }, [navigateAndReset]);

  const handleNotifications = useCallback(() => {
    console.log('Abrir notificaciones');
    setNotificationCount(0);
  }, []);

  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.headerOuter}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={favicon}
              style={styles.headerIcon}
              accessibilityIgnoresInvertColors
              accessibilityLabel="App logo"
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.headerText}
              accessibilityRole="text"
            >
              k'aaxil ba'alilche'
            </Text>
            <Text style={styles.headerSubtitle}>Avistamientos</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <NotificationButton
            onPress={handleNotifications}
            notificationCount={notificationCount}
            theme={theme}
          />

          <CreatePostButton onPress={handleCreatePost} theme={theme} />
        </View>
      </View>

      <View style={styles.tabsOuterContainer}>
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
                activeColor={colors.primary}
                inactiveColor={colors.textSecondary}
                styles={styles}
              />
            );
          })}

          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: colors.primary
              },
              animatedIndicatorStyle
            ]}
          />
        </View>
      </View>
    </View>
  );
}
