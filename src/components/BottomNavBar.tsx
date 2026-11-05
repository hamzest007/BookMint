import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme/tokens';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

interface BottomNavBarProps {
  onHomePress?: () => void;
  onExplorePress?: () => void;
  onLibraryPress?: () => void;
  onProfilePress?: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onHomePress,
  onExplorePress,
  onLibraryPress,
  onProfilePress,
}) => {
  if (isDesktop) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItemActive}
        onPress={onHomePress}
        activeOpacity={0.7}
      >
        <RNText style={styles.navIconActive}>🏠</RNText>
        <RNText style={styles.navTextActive}>Home</RNText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={onExplorePress}
        activeOpacity={0.7}
      >
        <RNText style={styles.navIcon}>🔎</RNText>
        <RNText style={styles.navText}>Explore</RNText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={onLibraryPress}
        activeOpacity={0.7}
      >
        <RNText style={styles.navIcon}>📚</RNText>
        <RNText style={styles.navText}>Library</RNText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <RNText style={styles.navIcon}>👤</RNText>
        <RNText style={styles.navText}>Profile</RNText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    ...Shadows.mobileNav,
    zIndex: 50,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  navItemActive: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors['secondary-container'],
    borderRadius: BorderRadius.full,
  },
  navIcon: {
    fontSize: 24,
    color: Colors['on-surface-variant'],
    marginBottom: 4,
  },
  navIconActive: {
    fontSize: 24,
    color: Colors['on-secondary-container'],
    marginBottom: 4,
  },
  navText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors['on-surface-variant'],
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  navTextActive: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors['on-secondary-container'],
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default BottomNavBar;
