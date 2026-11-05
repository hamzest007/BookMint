import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text as RNText, Dimensions } from 'react-native';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../theme/tokens';
import type { Book } from 'src/data/books';

const { width } = Dimensions.get('window');

interface ContinueReadingCardProps {
  book?: Book;
  onContinuePress?: () => void;
}

const defaultBook: Book = {
  id: '1',
  title: 'Atomic Habits',
  author: 'James Clear',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwoy_3LhSTYaP78435ykZSXLBXybtuvvKokZG7Re8wbw8AIWUyXCsCRdB7ifYU97MNwKDumQ_1X9Li8Zf3MyPznSxUdXc1hjsMkUHBK4NH6OVDhhmEqYsglYH_0HZBNYZtt81kUgeT7pB1eOnAUTB0OzW16AffR0joW3Zc8NKZfa82gqKcZm_JgHaFgpdbnnqqCOzUPi3nBp1I4W2f5ic4Jk-YLrEI8R1vnWvYEjiYHWPKW60Zl-PV',
  category: 'Self Development',
  progress: 72,
  currentChapter: 15,
  pageCount: 320,
  currentPage: 124,
  description: 'A practical guide to building better habits through small, repeatable changes.',
};

const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  book = defaultBook,
  onContinuePress,
}) => {
  const isDesktop = width >= 768;
  const hasCoverImage = Boolean(book.coverUrl);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.sectionIcon}>📖</RNText>
        <RNText style={styles.sectionTitle}>Continue Reading</RNText>
      </View>

      <View style={[styles.card, isDesktop ? styles.cardRow : styles.cardColumn]}>
        <View style={[styles.bookCoverContainer, isDesktop ? styles.bookCoverDesktop : styles.bookCoverMobile]}>
          {hasCoverImage ? (
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.bookCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fallbackCover}>
              <RNText style={styles.fallbackCategory}>{book.category || 'AI BOOK'}</RNText>
              <RNText style={styles.fallbackTitle} numberOfLines={4}>{book.title}</RNText>
              <View style={styles.fallbackRule} />
              <RNText style={styles.fallbackAuthor} numberOfLines={1}>{book.author}</RNText>
            </View>
          )}
        </View>

        <View style={styles.bookInfo}>
          <RNText style={styles.category}>{book.category}</RNText>
          <RNText style={[styles.title, isDesktop ? null : styles.titleMobile]}>{book.title}</RNText>
          <RNText style={styles.author}>{book.author}</RNText>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <RNText style={styles.progressText}>{`${book.progress}% Completed`}</RNText>
              <RNText style={styles.chapterText}>Chapter {book.currentChapter}</RNText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: book.progress + '%' }]} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, isDesktop ? styles.continueButtonDesktop : styles.continueButtonMobile]}
            onPress={onContinuePress}
            activeOpacity={0.7}
          >
            <RNText style={styles.continueButtonText}>Continue</RNText>
            <RNText style={styles.arrowIcon}>→</RNText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['stack-lg'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['stack-sm'],
  },
  sectionIcon: {
    fontSize: 20,
    color: Colors.secondary,
  },
  sectionTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '600',
    color: Colors.primary,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.ambient,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardColumn: {
    flexDirection: 'column',
  },
  bookCoverContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.ambient,
    borderWidth: 1,
    borderColor: Colors['surface-variant'],
  },
  bookCoverDesktop: {
    width: 96,
    height: 144,
  },
  bookCoverMobile: {
    width: 128,
    height: 192,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  fallbackCover: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  fallbackCategory: {
    color: Colors['secondary-fixed'],
    fontSize: Typography.size.caption,
    fontWeight: '800',
    letterSpacing: 1,
  },
  fallbackTitle: {
    color: Colors.white,
    fontFamily: 'Playfair Display',
    fontSize: 24,
    lineHeight: 26,
    textAlign: 'center',
  },
  fallbackRule: {
    height: 1,
    width: 34,
    backgroundColor: Colors['secondary-fixed'],
    alignSelf: 'center',
  },
  fallbackAuthor: {
    color: Colors['on-primary-container'],
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '700',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.size['headline-md'],
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: Typography.size['headline-md-mobile'],
  },
  author: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  chapterText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors['surface-container-highest'],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.ambient,
  },
  continueButtonDesktop: {
    width: 'auto',
  },
  continueButtonMobile: {
    width: '100%',
  },
  continueButtonText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors['on-primary'],
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  arrowIcon: {
    fontSize: 18,
    color: Colors['on-primary'],
  },
});

export default ContinueReadingCard;
