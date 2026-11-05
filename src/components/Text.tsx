import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography } from '../theme/tokens';

interface TextProps {
  children: React.ReactNode;
  variant?: 'label-caps' | 'body-md' | 'body-lg' | 'title-sm' | 'headline-md-mobile' | 'headline-md' | 'display-lg-mobile' | 'display-lg' | 'caption' | 'body' | 'bodyMedium' | 'h4' | 'h3' | 'h2' | 'h1';
  color?: string;
  weight?: keyof typeof Typography.weight;
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}

const CustomText: React.FC<TextProps> = ({
  children,
  variant = 'body-md',
  color = Colors['on-surface'],
  weight = 'regular',
  style,
  numberOfLines,
  onPress,
}) => {
  const getTextStyle = (): TextStyle => {
    return {
      fontSize: Typography.size[variant],
      color,
      fontWeight: Typography.weight[weight],
    };
  };

  return (
    <RNText
      style={[styles.text, getTextStyle(), style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Base text styles
  },
});

export default CustomText;