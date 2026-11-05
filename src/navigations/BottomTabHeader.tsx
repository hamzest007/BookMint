import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text as RNText, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Spacing, Typography } from 'src/theme/tokens';

export const BottomTabHeader = ({ route, options }: any) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const title = options.title ?? route.name;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.left} />

      <View style={styles.center}>
        <Icon
          name="book-open-page-variant"
          size={18}
          color={theme.colors.primary}
          style={styles.titleIcon}
        />
        <RNText style={styles.title}>{title}</RNText>
      </View>

      <View style={styles.right} />
    </View>
  );
};

const useStyles = (theme: any) => ({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  left: {
    width: 60,
    alignItems: 'flex-start' as const,
  },
  center: {
    flex: 1,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
  },
  right: {
    width: 60,
  },
  title: {
    fontSize: 16,
    fontFamily: Typography.family.semibold,
  },
  titleIcon: {
    marginRight: 8,
  },
});
