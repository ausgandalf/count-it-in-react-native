import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { getColors } from '@/functions/common';

export default function TabLayout() {
  const themeColors = getColors();
  return (
    <View style={{flex: 1, backgroundColor: themeColors.deepBackground,}}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColors.tint,
          tabBarActiveBackgroundColor: themeColors.activeTabBackground,
          tabBarInactiveTintColor: themeColors.text,
          tabBarInactiveBackgroundColor: themeColors.deepBackground,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {
              borderTopWidth: 0,
            },
          })
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
