import React from 'react';
import { StyleSheet, TouchableOpacity, Text as RNText, ActivityIndicator, TextStyle } from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: BorderRadius.md,
      gap: Spacing.sm,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
      },
      medium: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
      },
      large: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? Colors.outline : Colors.primary,
        ...Shadows.ambient,
      },
      secondary: {
        backgroundColor: disabled ? Colors.outline : Colors.secondary,
        ...Shadows.ambient,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? Colors.outline : Colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles: Record<string, { color: string }> = {
      primary: {
        color: Colors['on-primary'],
      },
      secondary: {
        color: Colors['on-secondary'],
      },
      outline: {
        color: disabled ? Colors.outline : Colors.primary,
      },
      ghost: {
        color: disabled ? Colors.outline : Colors.primary,
      },
    };

    return {
      fontSize: Typography.size['label-caps'],
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.1,
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors['on-primary'] : Colors.primary} />
      ) : (
        <>
          {icon && <RNText style={styles.icon}>{icon}</RNText>}
          <RNText style={getTextStyle()}>{title}</RNText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
  },
  icon: {
    fontSize: 18,
  },
});

export default Button;
