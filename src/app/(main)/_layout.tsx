import React from 'react';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTabs from '@/components/app-tabs';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext(Navigator);
const TopTabs = MaterialTopTabs as any;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: any) => <AppTabs {...props} />}
      initialRouteName="index"
      sceneContainerStyle={{
        backgroundColor: '#FFFFFF',
      }}
      screenOptions={{
        swipeEnabled: false,
      }}
    >
      <TopTabs.Screen name="profile" options={{ title: 'حسابي' }} />
      <TopTabs.Screen name="orders" options={{ title: 'طلباتي' }} />
      <TopTabs.Screen name="cart" options={{ title: 'السلة' }} />
      <TopTabs.Screen name="index" options={{ title: 'الرئيسية' }} />
    </TopTabs>
  );
}
