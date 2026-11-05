import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text as RNText,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography } from 'src/theme/tokens';
import Sidebar from 'src/components/Sidebar';
import GlobalSearch from 'src/components/GlobalSearch';
import ContinueReadingCard from 'src/components/ContinueReadingCard';
import TrendingSection from 'src/components/TrendingSection';
import BookItem from 'src/components/BookItem';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/types';

import { useBooks } from 'src/context/BookContext';
import { useAuth } from 'src/context/AuthContext';
import { fetchOnlineBookContent, fetchAllOnlineBooks } from 'src/services/gutendex';
import { fetchPublicBooks, isPublicBooksBackendReady } from 'src/services/publicBooks';
import type { Book } from 'src/data/books';

const HomeScreen: React.FC = () => {
  const { width } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 768;
  const [onlineBooks, setOnlineBooks] = useState<Book[]>([]);
  const [publicBooks, setPublicBooks] = useState<Book[]>([]);
  const [loadingOnlineBooks, setLoadingOnlineBooks] = useState(true);
  const [loadingPublicBooks, setLoadingPublicBooks] = useState(true);
  const [onlineBooksError, setOnlineBooksError] = useState('');
  const [publicBooksError, setPublicBooksError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { books } = useBooks();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const loadOnlineBooks = async () => {
      try {
        setLoadingOnlineBooks(true);
        console.log('Starting to load online books...');
        const items = await fetchAllOnlineBooks(50); // Reduced from 1000 for testing
        console.log('Received online books:', items.length);
        if (!cancelled) {
          setOnlineBooks(items);
          console.log('Set online books state with', items.length, 'items');
        }
      } catch (error) {
        console.error('Error loading online books:', error);
        if (!cancelled) {
          setOnlineBooksError('Could not load online books right now.');
        }
      } finally {
        if (!cancelled) {
          setLoadingOnlineBooks(false);
          console.log('Finished loading online books, loading state set to false');
        }
      }
    };

    loadOnlineBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPublicBooks = async () => {
      if (!isPublicBooksBackendReady()) {
        setLoadingPublicBooks(false);
        return;
      }

      try {
        setLoadingPublicBooks(true);
        const items = await fetchPublicBooks();
        if (!cancelled) {
          setPublicBooks(items);
        }
      } catch {
        if (!cancelled) {
          setPublicBooksError('Could not load public books right now.');
        }
      } finally {
        if (!cancelled) {
          setLoadingPublicBooks(false);
        }
      }
    };

    loadPublicBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleContinueReading = (book: typeof books[0]) => {
    navigation.navigate('BookReader', {
      book,
    });
  };

  const openBook = async (book: Book) => {
    try {
      if (book.source === 'Gutendex') {
        const content = await fetchOnlineBookContent(book);
        navigation.navigate('BookReader', {
          book: {
            ...book,
            content,
            pageCount: Math.max(1, Math.ceil(content.length / 500)),
            currentPage: 1,
          },
        });
        return;
      }

      navigation.navigate('BookReader', { book });
    } catch {
      navigation.navigate('BookReader', { book });
    }
  };

  const handleBookPress = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      openBook(book);
    }
  };

  const featuredBook = books.length > 0 ? books[0] : undefined;
  const publicShelfBooks = publicBooks.length > 0 ? publicBooks : books.filter(book => book.visibility === 'Public');
  const onlineBooksHeader = useMemo(
    () => (onlineBooks.length > 0 ? 'Read online books' : 'Online books'),
    [onlineBooks.length],
  );
  const publicBooksHeader = useMemo(
    () => (publicShelfBooks.length > 0 ? 'Public bookshelf' : 'Public bookshelf'),
    [publicShelfBooks.length],
  );
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    const uniqueBooks = Array.from(
      new Map([...onlineBooks, ...publicShelfBooks, ...books].map(book => [book.id, book])).values(),
    );
    return uniqueBooks.filter(book =>
      [book.title, book.author, book.category, book.description, book.tags]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(query)),
    ).slice(0, 8);
  }, [books, onlineBooks, publicShelfBooks, searchQuery]);

  const showQuickStart = !searchQuery.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {/* Desktop Sidebar */}
        {isDesktop && (
          <Sidebar
            onHomePress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            onExplorePress={() => Alert.alert('Explore', 'Search and discovery is coming next.')}
            onLibraryPress={() => navigation.navigate('MainTabs', { screen: 'Library' })}
            onProfilePress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
          />
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}>

          {/* Mobile Greeting */}
          {!isDesktop && (
            <View style={styles.mobileGreeting}>
              <RNText style={styles.greetingLabel}>
                Good morning,
              </RNText>

              <RNText style={styles.greetingName}>
                {user?.name || 'Reader'} 👋
              </RNText>
              <RNText style={styles.greetingHandle}>
                {user?.handle || '@reader'}
              </RNText>
            </View>
          )}

          {showQuickStart ? (
            <View style={styles.quickStartCard} accessibilityRole="summary">
              <View style={styles.quickStartHeader}>
                <RNText style={styles.quickStartIcon}>✨</RNText>
                <View style={styles.quickStartCopy}>
                  <RNText style={styles.quickStartTitle}>Quick start</RNText>
                  <RNText style={styles.quickStartSubtitle}>
                    Pick up where you left off, discover something new, or add your own book.
                  </RNText>
                </View>
              </View>
              <View style={styles.quickStartActions}>
                <TouchableOpacity
                  style={styles.quickStartAction}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Library' })}
                  accessibilityRole="button"
                >
                  <RNText style={styles.quickStartActionText}>Open library</RNText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickStartActionSecondary}
                  onPress={() => navigation.navigate('TopRatedBooks')}
                  accessibilityRole="button"
                >
                  <RNText style={styles.quickStartActionSecondaryText}>Explore picks</RNText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickStartActionTertiary}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Upload' })}
                  accessibilityRole="button"
                >
                  <RNText style={styles.quickStartActionTertiaryText}>Add book</RNText>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <GlobalSearch value={searchQuery} onChangeText={setSearchQuery} />

          {searchQuery.trim() ? (
            <View style={styles.searchResults} accessibilityLiveRegion="polite">
              <RNText style={styles.searchResultsTitle}>
                {searchResults.length ? `Results for “${searchQuery.trim()}”` : 'No matches found'}
              </RNText>
              {searchResults.length ? searchResults.map(book => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.searchResultRow}
                  onPress={() => openBook(book)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${book.title} by ${book.author}`}
                >
                  <View style={styles.searchResultIcon}><RNText>📖</RNText></View>
                  <View style={styles.searchResultCopy}>
                    <RNText style={styles.searchResultBook} numberOfLines={1}>{book.title}</RNText>
                    <RNText style={styles.searchResultAuthor} numberOfLines={1}>{book.author} · {book.category}</RNText>
                  </View>
                  <RNText style={styles.searchResultArrow}>›</RNText>
                </TouchableOpacity>
              )) : (
                <View style={styles.noResults}>
                  <RNText style={styles.noResultsCopy}>Try a title, author, or topic. You can also add your own book to get started.</RNText>
                  <TouchableOpacity
                    style={styles.addBookButton}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Upload' })}
                    accessibilityRole="button"
                  >
                    <RNText style={styles.addBookButtonText}>Create a book</RNText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null}

          {featuredBook ? (
            <ContinueReadingCard
              book={featuredBook}
              onContinuePress={() => handleContinueReading(featuredBook)}
            />
          ) : null}

          <TrendingSection
            books={onlineBooks.length > 0 ? onlineBooks : books}
            onViewAllPress={() => navigation.navigate('TopRatedBooks')}
            onBookPress={onlineBooks.length > 0 ? (bookId) => {
              const book = onlineBooks.find(b => b.id === bookId);
              if (book) {
                openBook(book);
              }
            } : handleBookPress}
            title={onlineBooks.length > 0 ? 'Top Rated Picks' : 'Trending This Week'}
            subtitle={onlineBooks.length > 0 ? 'Most popular books from the public catalog' : 'Popular books from your library'}
          />

          <View style={styles.onlineBooksSection}>
            <View style={styles.onlineBooksHeader}>
              <View style={styles.onlineBooksTitleRow}>
                <RNText style={styles.onlineBooksIcon}>🌍</RNText>
                <RNText style={styles.onlineBooksTitle}>{publicBooksHeader}</RNText>
              </View>
              <RNText style={styles.onlineBooksSubtitle}>
                Public books are shared across users when the backend is connected.
              </RNText>
            </View>

            {loadingPublicBooks ? (
              <View style={styles.onlineBooksLoading}>
                <ActivityIndicator color={Colors.primary} />
                <RNText style={styles.onlineBooksLoadingText}>Loading public books...</RNText>
              </View>
            ) : publicBooksError ? (
              <RNText style={styles.onlineBooksError}>{publicBooksError}</RNText>
            ) : publicShelfBooks.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.onlineBooksScroll}
              >
                {publicShelfBooks.map((book) => (
                  <BookItem
                    key={book.id}
                    book={book}
                    onPress={() => openBook(book)}
                  />
                ))}
              </ScrollView>
            ) : (
              <RNText style={styles.onlineBooksError}>No public books yet. Publish one as Public to start the shelf.</RNText>
            )}
          </View>

          <View style={styles.onlineBooksSection}>
            <View style={styles.onlineBooksHeader}>
              <View style={styles.onlineBooksTitleRow}>
                <RNText style={styles.onlineBooksIcon}>🌐</RNText>
                <RNText style={styles.onlineBooksTitle}>{onlineBooksHeader}</RNText>
                <TouchableOpacity onPress={() => navigation.navigate('TopRatedBooks')}>
                  <RNText style={styles.viewAllText}>View all →</RNText>
                </TouchableOpacity>
              </View>
              <RNText style={styles.onlineBooksSubtitle}>
                Public-domain books fetched from the internet and ready to read.
              </RNText>
            </View>

            {loadingOnlineBooks ? (
              <View style={styles.onlineBooksLoading}>
                <ActivityIndicator color={Colors.primary} />
                <RNText style={styles.onlineBooksLoadingText}>Loading online books...</RNText>
              </View>
            ) : onlineBooksError ? (
              <RNText style={styles.onlineBooksError}>{onlineBooksError}</RNText>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.onlineBooksScroll}
              >
                {onlineBooks.map((book) => (
                  <BookItem
                    key={book.id}
                    book={book}
                    onPress={() => openBook(book)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing['margin-mobile'],
    paddingBottom: 100,
  },

  mobileGreeting: {
    marginBottom: Spacing['stack-md'],
  },

  greetingLabel: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
    marginBottom: 4,
  },

  greetingName: {
    fontSize: Typography.size['headline-md-mobile'],
    color: Colors.primary,
    fontWeight: '600',
  },
  greetingHandle: {
    marginTop: 2,
    fontSize: Typography.size['label-caps'],
    color: Colors['on-surface-variant'],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  onlineBooksSection: {
    marginBottom: Spacing['stack-lg'],
  },
  onlineBooksHeader: {
    marginBottom: Spacing['stack-sm'],
  },
  onlineBooksTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  onlineBooksIcon: {
    fontSize: 20,
  },
  onlineBooksTitle: {
    fontSize: Typography.size['title-sm'],
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  viewAllText: {
    fontSize: Typography.size.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  onlineBooksSubtitle: {
    fontSize: Typography.size['body-md'],
    color: Colors['on-surface-variant'],
  },
  onlineBooksLoading: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineBooksLoadingText: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['body-md'],
  },
  onlineBooksError: {
    color: Colors.secondary,
    fontSize: Typography.size['body-md'],
  },
  onlineBooksScroll: {
    paddingRight: Spacing.md,
  },
  searchResults: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: 16,
    marginTop: -Spacing.sm,
    marginBottom: Spacing['stack-md'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors['outline-variant'],
  },
  searchResultsTitle: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.size['body-md'],
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors['outline-variant'] },
  searchResultIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors['surface-container-low'], alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  searchResultCopy: { flex: 1, minWidth: 0 },
  searchResultBook: { color: Colors['on-surface'], fontSize: Typography.size['body-md'], fontWeight: '700' },
  searchResultAuthor: { color: Colors['on-surface-variant'], fontSize: Typography.size.caption, marginTop: 2 },
  searchResultArrow: { color: Colors.primary, fontSize: 28, marginLeft: Spacing.sm },
  noResults: { padding: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors['outline-variant'] },
  noResultsCopy: { color: Colors['on-surface-variant'], fontSize: Typography.size['body-md'], lineHeight: 20 },
  addBookButton: { alignSelf: 'flex-start', backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: 10, marginTop: Spacing.md },
  addBookButtonText: { color: Colors['on-primary'], fontWeight: '700', fontSize: Typography.size.caption },
  quickStartCard: {
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing['stack-md'],
    borderWidth: 1,
    borderColor: Colors['outline-variant'],
  },
  quickStartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  quickStartIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  quickStartCopy: {
    flex: 1,
    minWidth: 0,
  },
  quickStartTitle: {
    color: Colors.primary,
    fontSize: Typography.size['title-sm'],
    fontWeight: '700',
  },
  quickStartSubtitle: {
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['body-md'],
    lineHeight: 20,
    marginTop: 4,
  },
  quickStartActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
  },
  quickStartAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
  },
  quickStartActionText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Typography.size.caption,
  },
  quickStartActionSecondary: {
    backgroundColor: Colors['surface-container-high'],
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
  },
  quickStartActionSecondaryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: Typography.size.caption,
  },
  quickStartActionTertiary: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors['outline-variant'],
  },
  quickStartActionTertiaryText: {
    color: Colors['on-surface'],
    fontWeight: '700',
    fontSize: Typography.size.caption,
  },
});

export default HomeScreen;
