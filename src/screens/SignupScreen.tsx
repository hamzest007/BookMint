import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from 'src/theme/tokens';
import { useAuth } from 'src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SignupScreen: React.FC = () => {
  const { signup } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Image selection failed', result.errorMessage || 'Could not select the image. Please try again.');
        return;
      }

      if (result.assets && result.assets[0] && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Image selection failed', 'Could not select the image. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing information', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, password, avatarUri || undefined);
      Alert.alert('Success', 'Your account has been created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs' as never) },
      ]);
    } catch (error) {
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login' as never);
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
          <Text style={styles.title}>Create your account.</Text>
          <Text style={styles.subtitle}>
            Join Bookmint to save books, publish drafts, and keep your library in one place.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>START YOUR SHELF</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors['on-surface-variant']}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={Colors['on-surface-variant']}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor={Colors['on-surface-variant']}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Profile picture</Text>
            {avatarUri ? (
              <View style={styles.avatarPreview}>
                <Image source={{ uri: avatarUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setAvatarUri('')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeButtonText}>Remove photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.avatarPicker} onPress={handlePickAvatar} activeOpacity={0.8}>
                <Text style={styles.avatarPickerTitle}>Add a profile photo</Text>
                <Text style={styles.avatarPickerSubtitle}>Optional, but it helps personalize your shelf.</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Creating account...' : 'Create your account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleNavigateToLogin} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    backgroundColor: 'rgba(197,160,89,0.18)',
    right: -65,
    top: -55,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.08)',
    left: -30,
    bottom: -35,
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
    maxWidth: 320,
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
  avatarPreview: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  previewImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: Colors['surface-container-high'],
  },
  removeButton: {
    backgroundColor: Colors['surface-container-high'],
    borderRadius: BorderRadius.lg,
    paddingVertical: 11,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
  },
  removeButtonText: {
    color: Colors.primary,
    fontSize: Typography.size['label-caps'],
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  avatarPicker: {
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
    borderStyle: 'dashed',
  },
  avatarPickerTitle: {
    color: Colors.primary,
    fontSize: Typography.size['body-md'],
    fontWeight: '800',
    marginBottom: 4,
  },
  avatarPickerSubtitle: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size.caption,
    lineHeight: 18,
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

export default SignupScreen;
