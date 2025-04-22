import { Tabs } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/components/LanguageContext';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'cog' : 'cog-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: 'Language',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'earth' : 'earth-outline'} color={color} />
              ),
            }}
          />
        </Tabs>
      </NavigationContainer>
    </LanguageProvider>
  );
}
