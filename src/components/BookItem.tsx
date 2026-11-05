import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text as RNText } from 'react-native';
import { Colors, Spacing, Shadows, BorderRadius } from '../theme/tokens';

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  category?: string;
  isGenerated?: boolean;
}

interface BookItemProps {
  book: Book;
  onPress?: () => void;
}

const BookItem: React.FC<BookItemProps> = ({ book, onPress }) => {
  const hasCoverImage = Boolean(book.coverUrl);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.bookCoverContainer}>
        {hasCoverImage ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={styles.bookCover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallbackCover}>
            <RNText style={styles.fallbackCategory}>
              {book.category || 'AI BOOK'}
            </RNText>
            <RNText style={styles.fallbackTitle} numberOfLines={4}>
              {book.title}
            </RNText>
            <View style={styles.fallbackRule} />
            <RNText style={styles.fallbackAuthor} numberOfLines={1}>
              {book.author}
            </RNText>
          </View>
        )}
      </View>
      <RNText style={styles.title} numberOfLines={1}>{book.title}</RNText>
      <RNText style={styles.author} numberOfLines={1}>{book.author}</RNText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 144,
    marginRight: Spacing.md,
  },
  bookCoverContainer: {
    width: 144,
    height: 224,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    ...Shadows.ambient,
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 14,
    justifyContent: 'space-between',
  },
  fallbackCategory: {
    color: Colors['secondary-fixed'],
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  fallbackTitle: {
    color: Colors.white,
    fontFamily: 'Playfair Display',
    fontSize: 22,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 12,
  },
  fallbackRule: {
    height: 1,
    width: 42,
    backgroundColor: Colors['secondary-fixed'],
    alignSelf: 'center',
    marginVertical: 6,
  },
  fallbackAuthor: {
    color: Colors['on-primary-container'],
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  author: {
    fontSize: 14,
    color: Colors['on-surface-variant'],
  },
});

export default BookItem;
