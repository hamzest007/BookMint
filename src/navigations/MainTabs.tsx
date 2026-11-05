import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import React from 'react';
import { AppHeader } from './AppHeader';
import HomeScreen from '../screens/HomeScreen';
import CustomTabBar from './CustomTabBar';
import type { MainTabParamList } from './types';
import LibraryScreen from '../screens/LibraryScreen';
import UploadScreen from '../screens/UploadScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;
const renderHeader = (props: any) => <AppHeader {...props} />;

export const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: true,
        header: renderHeader,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'BookMint' }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: 'Upload' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
