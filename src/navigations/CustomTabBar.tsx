import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows, BorderRadius } from '../theme/tokens';

const icons: Record<string, string> = {
  Home: '🏠',
  Library: '📚',
  Upload: '➕',
  Profile: '👤',
};

/** A dependency-free tab bar that works with any set of tab routes. */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: insets.bottom + Spacing.md }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || `${label} tab`}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={[styles.tab, isFocused && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.icon, isFocused && styles.activeIcon]}>
                {icons[route.name] ?? '•'}
              </Text>
              <Text style={[styles.label, isFocused && styles.activeLabel]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingTop: 2,
  },
  container: {
    flexDirection: 'row',
    minHeight: 68,
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors['outline-variant'],
    ...Shadows.ambient,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 32, 69, 0.04)',
  },
  icon: {
    color: Colors['on-surface-variant'],
    fontSize: 19,
    lineHeight: 21,
    marginBottom: 4,
  },
  activeIcon: { color: Colors.primary },
  label: {
    color: Colors['on-surface-variant'],
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  activeLabel: { color: Colors.primary, fontWeight: '700' },
});

export default CustomTabBar;
