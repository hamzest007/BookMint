import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from 'src/theme/tokens';

const notifications = [
  {
    title: 'New online books added',
    body: 'The trending shelf now pulls popular public-domain books from the internet.',
  },
  {
    title: 'Reader focus mode',
    body: 'Use focus mode in the reader to keep the page clean and distraction-free.',
  },
  {
    title: 'Custom book support',
    body: 'Paste your own text and read it like a book with pages and bookmarks.',
  },
];

const NotificationsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Quick updates and product highlights</Text>

      {notifications.map(item => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardBody}>{item.body}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Notifications', 'All caught up for now.')}
      >
        <Text style={styles.buttonText}>Mark all as read</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing['margin-mobile'],
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.size['headline-md-mobile'],
    fontWeight: '700',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors['surface-container-high'],
    ...Shadows.ambient,
  },
  cardTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    color: Colors['on-primary'],
    fontSize: Typography.size['label-caps'],
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});

export default NotificationsScreen;
