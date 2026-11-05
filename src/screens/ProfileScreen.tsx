import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from 'src/theme/tokens';
import scale from 'src/utils/scale';
import { useBooks } from 'src/context/BookContext';
import { useAuth } from 'src/context/AuthContext';

const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { books } = useBooks();
  const { user, logout, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUri ?? '');

  const completedBooks = books.filter(book => book.progress === 100).length;
  const totalBooks = books.length;
  const averageProgress = totalBooks > 0
    ? Math.round(books.reduce((sum, book) => sum + book.progress, 0) / totalBooks)
    : 0;
  const generatedBooks = books.filter(book => book.isGenerated).length;
  const publishedBooks = books.filter(book => Boolean(book.publishedAt)).length;
  const publicBooks = books.filter(book => book.visibility === 'Public').length;
  const totalWordsWritten = books.reduce((sum, book) => sum + Math.max(0, Math.round((book.content?.length || 0) / 5)), 0);
  const aiBooksWithModel = books.filter(book => book.aiModel).length;

  const recentBooks = useMemo(
    () => [...books].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3),
    [books],
  );

  const profileStats = [
    { label: 'Total books', value: totalBooks.toString() },
    { label: 'Completed', value: completedBooks.toString() },
    { label: 'Avg progress', value: `${averageProgress}%` },
  ];

  const publishingStats = [
    { label: 'Generated books', value: generatedBooks.toString() },
    { label: 'Published', value: publishedBooks.toString() },
    { label: 'Public', value: publicBooks.toString() },
    { label: 'AI models', value: aiBooksWithModel.toString() },
  ];
  const activityBars = [
    { label: 'Generated', value: generatedBooks },
    { label: 'Published', value: publishedBooks },
    { label: 'Public', value: publicBooks },
  ];

  const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyCkkLxJ0J0vftoZoallwcHQcEs1Ws0mY96Ub8jxJlFrg1DohCixNKFoLOCN6gDI7fZsJtRehP04gRaFt1dDIOgx_mgUELXdkOeFmV2wDBmAEblhqlQzsdpgAENjPAqY42234Qqjcin8NvELc1d25KzitK_2os_rCqF6JaoHCkok0aueaTxB0IIs3XxmZ3vcE8ITgpqqg433Px-Dl6Z1DlJhznzGlqtebnDFs1xH06LxkUZUTS0R06';

  const handleLogout = async () => {
    Alert.alert('Log out of BookMint?', 'Your books and reading progress will stay saved on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const openEdit = () => {
    setName(user?.name ?? '');
    setHandle(user?.handle ?? '');
    setBio(user?.bio ?? '');
    setAvatarUri(user?.avatarUri ?? '');
    setEditOpen(true);
  };

  const saveProfile = async () => {
    const cleanName = name.trim();
    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;

    if (!cleanName || !cleanHandle) {
      Alert.alert('Missing information', 'Name and handle are required.');
      return;
    }

    await updateUser({
      name: cleanName,
      handle: cleanHandle,
      bio: bio.trim(),
      avatarUri: avatarUri.trim() || undefined,
    });
    setEditOpen(false);
    Alert.alert('Profile saved', 'Your profile has been updated.');
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            <Image
              source={{
                uri: user?.avatarUri || defaultAvatar,
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>{user?.name || 'Reader'}</Text>
          <Text style={styles.handle}>{user?.handle || '@reader'}</Text>
          <Text style={styles.bio}>
            {user?.bio || 'Building a calmer reading habit, one chapter at a time.'}
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.primaryAction} activeOpacity={0.8} onPress={openEdit}>
              <Text style={styles.primaryActionText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Log out">
              <Text style={styles.secondaryActionText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          {profileStats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publishing analytics</Text>
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsTopRow}>
              <View>
                <Text style={styles.analyticsKicker}>BOOKMINT AI</Text>
                <Text style={styles.analyticsTitle}>Your publishing snapshot</Text>
              </View>
              <View style={styles.analyticsBadge}>
                <Text style={styles.analyticsBadgeText}>Live</Text>
              </View>
            </View>

            <View style={styles.analyticsStats}>
              {publishingStats.map(stat => (
                <View key={stat.label} style={styles.analyticsStat}>
                  <Text style={styles.analyticsStatValue}>{stat.value}</Text>
                  <Text style={styles.analyticsStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.analyticsFooter}>
              <Text style={styles.analyticsFooterLabel}>Estimated words created</Text>
              <Text style={styles.analyticsFooterValue}>{totalWordsWritten.toLocaleString()}</Text>
            </View>

            <View style={styles.analyticsBars}>
              {activityBars.map(bar => (
                <View key={bar.label} style={styles.analyticsBarRow}>
                  <Text style={styles.analyticsBarLabel}>{bar.label}</Text>
                  <View style={styles.analyticsBarTrack}>
                    <View
                      style={[
                        styles.analyticsBarFill,
                        { width: `${Math.min(100, Math.max(12, bar.value * 34))}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent reading</Text>
          {recentBooks.length > 0 ? recentBooks.map(book => (
            <TouchableOpacity
              key={book.id}
              style={styles.recentBookItem}
              activeOpacity={0.8}
              onPress={() => Alert.alert(book.title, `You were reading ${book.progress}% of this book.`)}
            >
              <View style={styles.recentBookTextWrap}>
                <Icon name="book-open-page-variant" size={22} color={Colors.primary} />
                <View style={styles.recentBookText}>
                  <Text style={styles.menuLabel}>{book.title}</Text>
                  <Text style={styles.menuValue}>{book.author}</Text>
                </View>
              </View>
              <Text style={styles.recentBookProgress}>{book.progress}%</Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyRecentCard}>
              <Text style={styles.emptyRecentTitle}>No recent books yet</Text>
              <Text style={styles.emptyRecentSubtitle}>Open a book from Home or Library and it will appear here.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput style={styles.modalInput} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={Colors['on-surface-variant']} accessibilityLabel="Name" />
            <TextInput style={styles.modalInput} value={handle} onChangeText={setHandle} placeholder="@handle" placeholderTextColor={Colors['on-surface-variant']} accessibilityLabel="Handle" autoCapitalize="none" />
            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor={Colors['on-surface-variant']}
              multiline
              accessibilityLabel="Bio"
            />
            <TextInput style={styles.modalInput} value={avatarUri} onChangeText={setAvatarUri} placeholder="Avatar URL" placeholderTextColor={Colors['on-surface-variant']} accessibilityLabel="Avatar image URL" autoCapitalize="none" />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    marginVertical: scale.mWidth(16),
  },
  content: {
    paddingHorizontal: scale.mWidth(20),
    paddingBottom: Spacing.xl,
  },
  hero: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.ambient,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 999,
    padding: 4,
    backgroundColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  name: {
    fontSize: Typography.size['headline-md'],
    fontWeight: '700',
    color: Colors.primary,
  },
  handle: {
    fontSize: Typography.size['label-caps'],
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  bio: {
    marginTop: Spacing.md,
    fontSize: Typography.size['body-md'],
    lineHeight: 22,
    color: Colors['on-surface-variant'],
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  primaryActionText: {
    color: Colors['on-primary'],
    fontSize: Typography.size['label-caps'],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  secondaryAction: {
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  secondaryActionText: {
    color: Colors.primary,
    fontSize: Typography.size['label-caps'],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.ambient,
  },
  statValue: {
    fontSize: Typography.size['headline-md-mobile'],
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    marginTop: 4,
    fontSize: Typography.size['label-caps'],
    color: Colors['on-surface-variant'],
    textTransform: 'uppercase',
  },
  section: {
    marginTop: Spacing['stack-lg'],
  },
  sectionTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  analyticsCard: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.ambient,
  },
  analyticsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  analyticsKicker: {
    color: Colors.secondary,
    fontSize: Typography.size.caption,
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 4,
  },
  analyticsTitle: {
    color: Colors.primary,
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
  },
  analyticsBadge: {
    backgroundColor: Colors['secondary-container'],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  analyticsBadgeText: {
    color: Colors['on-secondary-container'],
    fontSize: Typography.size.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  analyticsStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  analyticsStat: {
    flexBasis: '48%',
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  analyticsStatValue: {
    color: Colors.primary,
    fontSize: Typography.size['headline-md-mobile'],
    fontWeight: '700',
  },
  analyticsStatLabel: {
    marginTop: 4,
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['label-caps'],
    textTransform: 'uppercase',
  },
  analyticsFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors['surface-variant'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyticsFooterLabel: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['body-md'],
  },
  analyticsFooterValue: {
    color: Colors.primary,
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
  },
  analyticsBars: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  analyticsBarRow: {
    gap: 6,
  },
  analyticsBarLabel: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['label-caps'],
    textTransform: 'uppercase',
  },
  analyticsBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors['surface-container-high'],
    overflow: 'hidden',
  },
  analyticsBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  recentBookItem: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.ambient,
  },
  recentBookTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  recentBookText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: Typography.size['body-md'],
    fontWeight: '700',
    color: Colors.primary,
  },
  menuValue: {
    fontSize: Typography.size['label-caps'],
    color: Colors['on-surface-variant'],
    marginTop: 2,
  },
  recentBookProgress: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyRecentCard: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.ambient,
  },
  emptyRecentTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  emptyRecentSubtitle: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.ambient,
  },
  modalTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors['outline-variant'],
    color: Colors['on-surface'],
    marginBottom: Spacing.sm,
  },
  bioInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors['surface-container-low'],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cancelButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  saveButtonText: {
    color: Colors['on-primary'],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
