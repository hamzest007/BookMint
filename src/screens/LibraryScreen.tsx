import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text as RNText, Dimensions, Alert, TextInput, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from 'src/theme/tokens';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/types';
import { useBooks } from 'src/context/BookContext';
import scale from 'src/utils/scale';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

type SortOption = 'title' | 'author' | 'progress' | 'date';

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { books, deleteBook, updateBook } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<typeof books[0] | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(books.map(book => book.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'progress':
        return b.progress - a.progress;
      case 'date':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const handleBookPress = (book: typeof books[0]) => {
    navigation.navigate('BookReader', { book });
  };

  const handleDeleteBook = (book: typeof books[0]) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBook(book.id)
        }
      ]
    );
  };

  const handleEditBook = (book: typeof books[0]) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    const cleanTitle = editTitle.trim();
    const cleanAuthor = editAuthor.trim();
    if (!cleanTitle || !cleanAuthor) {
      Alert.alert('Missing information', 'Add both a book title and author before saving.');
      return;
    }
    if (editingBook) {
      updateBook(editingBook.id, {
        title: cleanTitle,
        author: cleanAuthor,
      });
      setEditModalVisible(false);
      setEditingBook(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('title');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <RNText style={styles.title}>My Library</RNText>
          <RNText style={styles.subtitle}>Your personal book collection</RNText>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={Colors['on-surface-variant']}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search your library"
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const options: SortOption[] = ['title', 'author', 'progress', 'date'];
              const currentIndex = options.indexOf(sortBy);
              const nextIndex = (currentIndex + 1) % options.length;
              setSortBy(options[nextIndex]);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Sort books by ${sortBy}. Tap to change sort order.`}
          >
            <RNText style={styles.sortButtonText}>
              Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </RNText>
          </TouchableOpacity>
        </View>

        <View style={styles.filterHintRow}>
          <RNText style={styles.filterHintText}>
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} showing
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </RNText>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFilters}
            accessibilityRole="button"
            accessibilityLabel="Reset all library filters"
          >
            <RNText style={styles.resetButtonText}>Reset</RNText>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCategory === category }}
              >
                <RNText
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </RNText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <RNText style={styles.sectionTitle}>Continue Reading</RNText>
        </View>

        <View style={styles.booksGrid}>
          {sortedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <RNText style={styles.emptyTitle}>
                {searchQuery ? 'No books found' : 'No books in your library'}
              </RNText>
              <RNText style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Upload a PDF from the Upload tab to get started'}
              </RNText>
              {searchQuery ? (
                <TouchableOpacity style={styles.emptyAction} onPress={() => setSearchQuery('')}>
                  <RNText style={styles.emptyActionText}>Clear search</RNText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Upload' })}
                  accessibilityRole="button"
                >
                  <RNText style={styles.emptyActionText}>Create your first book</RNText>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            sortedBooks.map((book) => (
              <View key={book.id} style={styles.bookCard}>
                <TouchableOpacity
                  style={styles.bookContent}
                  onPress={() => handleBookPress(book)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Read ${book.title} by ${book.author}`}
                >
                  <View style={styles.bookCoverContainer}>
                    {book.coverUrl ? (
                      <Image
                        source={{ uri: book.coverUrl }}
                        style={styles.bookCoverImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.bookCoverFallback, book.isGenerated && styles.bookCoverGenerated]}>
                        <RNText style={styles.bookCoverCategory}>
                          {book.category || (book.isGenerated ? 'AI BOOK' : 'LIBRARY')}
                        </RNText>
                        <RNText style={styles.bookCoverTitle} numberOfLines={3}>
                          {book.title}
                        </RNText>
                        <View style={styles.bookCoverRule} />
                        <RNText style={styles.bookCoverAuthor} numberOfLines={1}>
                          {book.author}
                        </RNText>
                      </View>
                    )}
                  </View>
                  <RNText style={styles.bookTitle} numberOfLines={2}>{book.title}</RNText>
                  <RNText style={styles.bookAuthor} numberOfLines={1}>{book.author}</RNText>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: book.progress + '%' }]} />
                    </View>
                    <RNText style={styles.progressText}>{book.progress}%</RNText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteBook(book)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${book.title}`}
                >
                  <RNText style={styles.deleteButtonText}>🗑️</RNText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.editButton]}
                  onPress={() => handleEditBook(book)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${book.title}`}
                >
                  <RNText style={styles.deleteButtonText}>✏️</RNText>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNText style={styles.modalTitle}>Edit Book</RNText>
            <TextInput
              style={styles.modalInput}
              placeholder="Book Title"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholderTextColor={Colors['on-surface-variant']}
              accessibilityLabel="Book title"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Author"
              value={editAuthor}
              onChangeText={setEditAuthor}
              placeholderTextColor={Colors['on-surface-variant']}
              accessibilityLabel="Book author"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <RNText style={styles.modalButtonText}>Cancel</RNText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
              >
                <RNText style={styles.modalButtonText}>Save</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: Spacing['margin-mobile'],
  },
  header: {
    marginBottom: Spacing['stack-lg'],
  },
  searchContainer: {
    marginBottom: Spacing['stack-md'],
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size['body-md'],
    color: Colors.primary,
    ...Shadows.ambient,
  },
  sortButton: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    ...Shadows.ambient,
  },
  sortButtonText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors.primary,
  },
  filterHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterHintText: {
    flex: 1,
    color: Colors['on-surface-variant'],
    fontSize: Typography.size.caption,
  },
  resetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors['surface-container-high'],
  },
  resetButtonText: {
    color: Colors.primary,
    fontSize: Typography.size.caption,
    fontWeight: '700',
  },
  categoryContainer: {
    marginBottom: Spacing['stack-md'],
  },
  categoryChip: {
    backgroundColor: Colors['surface-container-high'],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors['on-surface-variant'],
  },
  categoryChipTextActive: {
    color: Colors['on-primary'],
  },
  title: {
    fontSize: Typography.size['display-lg-mobile'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
  },
  sectionHeader: {
    marginBottom: Spacing['stack-md'],
  },
  sectionTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '600',
    color: Colors.primary,
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  bookCard: {
    width: isDesktop ? 200 : (width - Spacing['margin-mobile'] * 2 - Spacing.md) / 2,
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.ambient,
    position: 'relative',
  },
  bookContent: {
    flex: 1,
  },
  bookCoverContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: Colors['surface-container-high'],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  bookCoverImage: {
    width: '100%',
    height: '100%',
  },
  bookCoverFallback: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.primary,
    justifyContent: 'space-between',
  },
  bookCoverGenerated: {
    backgroundColor: Colors.primary,
  },
  bookCoverCategory: {
    color: Colors['secondary-fixed'],
    fontSize: Typography.size.caption,
    letterSpacing: 1,
    fontWeight: '800',
  },
  bookCoverTitle: {
    color: Colors.white,
    fontFamily: 'Playfair Display',
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
  },
  bookCoverRule: {
    height: 1,
    width: 28,
    alignSelf: 'center',
    backgroundColor: Colors['secondary-fixed'],
  },
  bookCoverAuthor: {
    color: Colors['on-primary-container'],
    fontSize: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: Typography.size['body-md'],
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: Typography.size['label-caps'],
    color: Colors['on-surface-variant'],
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors['surface-container-highest'],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: Typography.size['label-caps'],
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    width: '100%',
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.ambient,
  },
  emptyTitle: {
    fontSize: Typography.size['body-lg'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  emptyActionText: { color: Colors['on-primary'], fontWeight: '700', fontSize: Typography.size['body-md'] },
  deleteButton: {
    position: 'absolute',
    right: Spacing.sm,
    width: scale.mWidth(32),
    height: scale.mWidth(32),
    borderRadius: BorderRadius.full,
    backgroundColor: Colors['surface-container-high'],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  editButton: {
    right: scale.mWidth(50),
  },
  deleteButtonText: {
    fontSize: scale.mWidth(12),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '80%',
    maxWidth: scale.mWidth(400),
    ...Shadows.ambient,
  },
  modalTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors['surface-container-high'],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: Typography.size['body-md'],
    color: Colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors['surface-container-high'],
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors['on-surface-variant'],
  },
});

export default LibraryScreen;
