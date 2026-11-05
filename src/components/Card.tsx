import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Shadows, BorderRadius } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: Colors['surface-container-lowest'],
      borderRadius: BorderRadius.lg,
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: { padding: 0 },
      small: { padding: Spacing.sm },
      medium: { padding: Spacing.lg },
      large: { padding: Spacing.xl },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        ...baseStyle,
        ...paddingStyles[padding],
      },
      elevated: {
        ...baseStyle,
        ...paddingStyles[padding],
        ...Shadows.ambient,
      },
      outlined: {
        ...baseStyle,
        ...paddingStyles[padding],
        borderWidth: 1,
        borderColor: Colors['outline-variant'],
      },
    };

    return variantStyles[variant];
  };

  return (
    <View style={[styles.card, getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;