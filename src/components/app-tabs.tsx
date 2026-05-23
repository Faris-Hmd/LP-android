import React from 'react';
import { View, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

import { ThemedText } from './themed-text';
import { Colors, AppColors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

export default function AppTabs({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + (item.p_qu || 1), 0);

  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    index: 'home',
    cart: 'shopping-cart',
    orders: 'package',
    profile: 'user',
  };

  const labelMap: Record<string, string> = {
    index: 'الرئيسية',
    cart: 'السلة',
    orders: 'طلباتي',
    profile: 'حسابي',
  };

  // Tabs rendered in RTL order from left to right (using flex-direction: row-reverse):
  // profile (Leftmost), orders, cart, index (Rightmost)
  const order = ['index', 'cart', 'orders', 'profile'];

  return (
    <View
      style={[
        styles.tabListContainer,
        {
          backgroundColor: '#FFFFFF',
          paddingBottom: insets.bottom || 12,
          height: 64 + (insets.bottom || 12),
        },
      ]}
    >
      {order.map((tabName) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tabName);
        if (routeIndex === -1) return null;

        const route = state.routes[routeIndex];
        const isFocused = state.index === routeIndex;
        const iconName = iconMap[tabName] || 'circle';
        const label = labelMap[tabName] || tabName;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconWrapper}>
              <Feather
                name={iconName}
                size={20}
                color={isFocused ? AppColors.primary : '#718096'}
              />
              {tabName === 'cart' && cartCount > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{cartCount}</ThemedText>
                </View>
              )}
            </View>
            <ThemedText
              style={[
                styles.tabText,
                isFocused ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 10,
    marginTop: 2,
  },
  tabTextActive: {
    color: AppColors.primary,
    fontFamily: 'Cairo-Bold',
  },
  tabTextInactive: {
    color: '#718096',
    fontFamily: 'Cairo-Medium',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 6,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    lineHeight: 10,
    textAlign: 'center',
  },
});
