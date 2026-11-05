import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Dimensions, Text as RNText, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme/tokens';

const { width } = Dimensions.get('window');

interface GlobalSearchProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search books, authors, topics...',
  onChangeText,
  value,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <View style={styles.searchIcon}>
          <RNText style={styles.icon}>🔍</RNText>
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          onChangeText={onChangeText}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel="Search books, authors, and topics"
          returnKeyType="search"
        />
        {value ? (
          <TouchableOpacity
            onPress={() => onChangeText?.('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearButton}
          >
            <RNText style={styles.clearText}>×</RNText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: width >= 768 ? 672 : '100%',
    marginBottom: Spacing['stack-md'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.ambient,
  },
  searchContainerFocused: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 20,
    color: Colors.outline,
  },
  input: {
    flex: 1,
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface'],
    padding: 0,
    minHeight: 24,
  },
  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { color: Colors['on-surface-variant'], fontSize: 26, lineHeight: 28 },
});

export default GlobalSearch;
