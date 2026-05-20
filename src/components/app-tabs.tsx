import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React from 'react';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';

export default function AppTabs() {
  const pathname = usePathname();
  const hideTabBar = pathname.startsWith('/product');

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      {!hideTabBar && (
        <TabList style={styles.absoluteContainer} asChild>
          <CustomTabList>
            <TabTrigger name="index" href="/" asChild>
              <TabButton name="index">الرئيسية</TabButton>
            </TabTrigger>
            <TabTrigger name="cart" href="/cart" asChild>
              <TabButton name="cart">السلة</TabButton>
            </TabTrigger>
            <TabTrigger name="orders" href="/orders" asChild>
              <TabButton name="orders">طلباتي</TabButton>
            </TabTrigger>
            <TabTrigger name="profile" href="/profile" asChild>
              <TabButton name="profile">حسابي</TabButton>
            </TabTrigger>
          </CustomTabList>
        </TabList>
      )}
    </Tabs>
  );
}

interface TabButtonProps extends TabTriggerSlotProps {
  name: string;
}

export function TabButton({ children, name, isFocused, ...props }: TabButtonProps) {
  const { cart } = useCart();
  // Calculate cartCount from cart items quantity
  const cartCount = cart.reduce((acc, item) => acc + (item.p_qu || 1), 0);

  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    index: 'home',
    cart: 'shopping-cart',
    orders: 'package',
    profile: 'user',
  };

  const iconName = iconMap[name] || 'circle';

  return (
    <Pressable {...props} style={styles.tabButton}>
      <View style={styles.iconWrapper}>
        <Feather
          name={iconName}
          size={20}
          color={isFocused ? '#E53E3E' : '#718096'}
        />
        {name === 'cart' && cartCount > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{cartCount}</ThemedText>
          </View>
        )}
      </View>
      <ThemedText
        style={[
          styles.tabText,
          isFocused ? styles.tabTextActive : styles.tabTextInactive,
        ]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        {
          backgroundColor: '#FFFFFF',
          paddingBottom: insets.bottom || 12,
          height: 64 + (insets.bottom || 12),
        },
      ]}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row-reverse', // RTL alignment
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
    color: '#E53E3E',
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
    backgroundColor: '#DC2626',
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
