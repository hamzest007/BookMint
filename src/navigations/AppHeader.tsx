import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps extends NativeStackHeaderProps {
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AppHeader = ({
  navigation,
  route,
  options,
  rightComponent,
  containerStyle,
}: AppHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const title = options.title ?? route.name;

  const canGoBack = navigation.canGoBack();

  const shouldShowBack =
    canGoBack && options.headerBackVisible !== false;
  const showHomeActions = route.name === 'Home';

  return (
    <View
      style={[
        styles.container,
        { height: insets.top + 56, paddingTop: insets.top },
        containerStyle,
      ]}
    >
      {/* Left */}
      <View style={styles.side}>
        {shouldShowBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={[styles.backIcon, { color: options.headerTintColor || Colors['on-surface'] }]}>←</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Center */}
      <View style={styles.titleWrap}>
        <Text style={styles.titleIcon}>📖</Text>
        <Text
          style={[
            styles.title,
            { color: options.headerTintColor || Colors['on-surface'] },
          ]}
          numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right */}
      <View style={styles.rightSide}>
        {showHomeActions ? (
          <>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('Notifications' as never)}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Notifications">
              <Text style={styles.actionIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile' as never)}
              style={styles.profileButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Profile">
              {user?.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profileIcon}>{user?.name?.[0]?.toUpperCase() || 'R'}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          rightComponent || <View style={styles.side} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  side: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    minWidth: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
  },

  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleIcon: {
    fontSize: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  profileButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  actionIcon: {
    fontSize: 18,
  },
  profileIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors['on-surface'],
  },
});
