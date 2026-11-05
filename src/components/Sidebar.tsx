import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme/tokens';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

interface SidebarProps {
  onHomePress?: () => void;
  onExplorePress?: () => void;
  onLibraryPress?: () => void;
  onProfilePress?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onHomePress,
  onExplorePress,
  onLibraryPress,
  onProfilePress,
}) => {
  if (!isDesktop) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sidebarCard}>
        <View style={styles.greetingSection}>
          <RNText style={styles.greetingLabel}>Good morning,</RNText>
          <RNText style={styles.greetingName}>Hamza 👋</RNText>
        </View>

        <View style={styles.navigation}>
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
            <RNText style={styles.navIcon}>🔍</RNText>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    padding: Spacing['margin-desktop'],
  },
  sidebarCard: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.ambient,
  },
  greetingSection: {
    marginBottom: Spacing['stack-lg'],
  },
  greetingLabel: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    marginBottom: 4,
  },
  greetingName: {
    fontSize: Typography.size['headline-md'],
    color: Colors.primary,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors['primary-container'],
  },
  navIcon: {
    fontSize: 20,
    color: Colors['on-surface-variant'],
  },
  navIconActive: {
    fontSize: 20,
    color: Colors['on-primary-container'],
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
    color: Colors['on-primary-container'],
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default Sidebar;
