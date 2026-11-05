import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from 'src/theme/tokens';
import { useAuth } from 'src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSignup = () => {
    navigation.navigate('Signup' as never);
  };

  const handleNavigateToAPITest = () => {
    navigation.navigate('APITest' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>BOOKMINT</Text>
          </View>
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>
            Sign in to keep reading, pick up drafts, and continue building your library.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>ACCESS YOUR SHELF</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={Colors['on-surface-variant']}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={Colors['on-surface-variant']}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Signing in...' : 'Sign in to Bookmint'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={handleNavigateToSignup} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleNavigateToAPITest}
            activeOpacity={0.8}
          >
            <Text style={styles.testButtonText}>Test API Connection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['margin-mobile'],
    paddingBottom: Spacing.xl,
  },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: Spacing.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.overlay,
  },
  heroGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: 'rgba(104,216,176,0.16)',
    right: -70,
    top: -60,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
    left: -35,
    bottom: -40,
  },
  brandPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  brandPillText: {
    color: Colors.white,
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: '800',
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.familyDisplay.bold,
    fontSize: 38,
    lineHeight: 42,
    marginTop: Spacing.lg,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: Typography.size['body-md'],
    lineHeight: 22,
    marginTop: Spacing.sm,
    maxWidth: 310,
  },
  formCard: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.ambient,
  },
  sectionLabel: {
    color: Colors.secondary,
    fontSize: Typography.size.caption,
    letterSpacing: 1.4,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.primary,
    fontSize: Typography.size['label-caps'],
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 15,
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface'],
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.ambient,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors['on-primary'],
    fontSize: Typography.size['label-caps'],
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  footerText: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['body-md'],
  },
  footerLink: {
    color: Colors.secondary,
    fontSize: Typography.size['body-md'],
    fontWeight: '800',
  },
  testButton: {
    backgroundColor: Colors['surface-container-high'],
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
  },
  testButtonText: {
    color: Colors.primary,
    fontSize: Typography.size['label-caps'],
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default LoginScreen;
