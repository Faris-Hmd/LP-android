import React from 'react';
import { View } from 'react-native';
import { withLayoutContext, useSegments } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AppTabs from '@/components/app-tabs';
import AppHeader from '@/components/app-header';
import { AppColors } from '@/constants/theme';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext(Navigator);
const TopTabs = MaterialTopTabs as any;

export default function TabLayout() {
  const segments = useSegments();
  const isProductDetail = (segments as string[]).includes('product');

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.lightBg }}>
      {!isProductDetail && <AppHeader />}
      <TopTabs
        tabBarPosition="bottom"
        tabBar={(props: any) => <AppTabs {...props} />}
        initialRouteName="index"
        sceneContainerStyle={{
          backgroundColor: AppColors.lightBg,
        }}
        screenOptions={{
          swipeEnabled: false,
        }}
      >
        <TopTabs.Screen name="profile" options={{ title: 'حسابي' }} />
        <TopTabs.Screen name="orders" options={{ title: 'طلباتي' }} />
        <TopTabs.Screen name="cart" options={{ title: 'السلة' }} />
        <TopTabs.Screen name="index" options={{ title: 'الرئيسية' }} />
        <TopTabs.Screen name="product" options={{ title: 'التفاصيل' }} />
      </TopTabs>
    </View>
  );
}
