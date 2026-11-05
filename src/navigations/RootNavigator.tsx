import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MainTabs } from './MainTabs';
import { navigationRef } from './navigationRef';
import BookReaderScreen from '../screens/BookReaderScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TopRatedBooksScreen from '../screens/TopRatedBooksScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import APITestScreen from '../screens/APITestScreen';
import UploadBookScreen from '../screens/UploadBookScreen';
import { AppHeader } from './AppHeader';
import {
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const renderHeader = (props: any) => <AppHeader {...props} />;

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen} accessibilityLabel="Loading BookMint">
        <Text style={styles.loadingMark}>📖</Text>
        <Text style={styles.loadingTitle}>BookMint</Text>
        <ActivityIndicator size="small" color="#002045" style={styles.loader} />
        <Text style={styles.loadingCopy}>Preparing your reading space…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={DefaultTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="BookReader"
              component={BookReaderScreen}
            />
            <Stack.Screen
              name="TopRatedBooks"
              component={TopRatedBooksScreen}
              options={{
                headerShown: true,
                header: renderHeader,
                title: 'Top Rated Books',
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                header: renderHeader,
              }}
            />
            <Stack.Screen
              name="APITest"
              component={APITestScreen}
              options={{
                headerShown: true,
                header: renderHeader,
                title: 'API Test',
              }}
            />
            <Stack.Screen
              name="UploadBook"
              component={UploadBookScreen}
              options={{
                headerShown: true,
                header: renderHeader,
                title: 'Upload Book',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="APITest"
              component={APITestScreen}
              options={{
                headerShown: true,
                header: renderHeader,
                title: 'API Test',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf9f4', padding: 24 },
  loadingMark: { fontSize: 36, marginBottom: 12 },
  loadingTitle: { color: '#002045', fontSize: 28, fontWeight: '800', letterSpacing: 0.3 },
  loader: { marginTop: 20 },
  loadingCopy: { color: '#43474e', fontSize: 14, marginTop: 12 },
});
