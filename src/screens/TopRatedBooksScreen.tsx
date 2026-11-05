import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Colors, BorderRadius, Shadows, Spacing, Typography } from 'src/theme/tokens';
import BookItem from 'src/components/BookItem';
import type { Book } from 'src/data/books';
import { fetchAllOnlineBooks, fetchOnlineBookContent } from 'src/services/gutendex';
import type { RootStackParamList } from 'src/navigations/types';

const TopRatedBooksScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBooks = async () => {
      try {
        setLoading(true);
        console.log('TopRatedBooks: Starting to load books...');
        const items = await fetchAllOnlineBooks(50); // Reduced from 1000 for testing
        console.log('TopRatedBooks: Received', items.length, 'books');
        if (!cancelled) {
          setBooks(items);
          console.log('TopRatedBooks: Set books state with', items.length, 'items');
        }
      } catch (error) {
        console.error('TopRatedBooks: Error loading books:', error);
        if (!cancelled) {
          setError('Could not load top rated books right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log('TopRatedBooks: Finished loading');
        }
      }
    };

    loadBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  const openBook = async (book: Book) => {
    try {
      const content = book.content || await fetchOnlineBookContent(book);
      navigation.navigate('BookReader', {
        book: {
          ...book,
          content,
          pageCount: Math.max(1, Math.ceil(content.length / 500)),
          currentPage: 1,
        },
      });
    } catch {
      Alert.alert('Could not open book', 'Please try again in a moment.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Top Rated Books</Text>
        <Text style={styles.subtitle}>Popular public-domain books from the catalog</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Loading top rated books...</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={books}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookWrap}
              activeOpacity={0.8}
              onPress={() => openBook(item)}
            >
              <BookItem book={item} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {typeof item.rating === 'number' ? `${item.rating} reads` : 'Top pick'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.error}>No books found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingHorizontal: Spacing['margin-mobile'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size['headline-md-mobile'],
    fontWeight: '700',
    color: Colors.primary,
  },
  subtitle: {
    marginTop: 4,
    color: Colors['on-surface-variant'],
    fontSize: Typography.size['body-md'],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors['on-surface-variant'],
  },
  error: {
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing['margin-mobile'],
    paddingBottom: Spacing.xl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  bookWrap: {
    width: '48%',
    alignItems: 'center',
  },
  badge: {
    marginTop: 6,
    backgroundColor: Colors['surface-container-lowest'],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors['surface-container-high'],
    ...Shadows.ambient,
  },
  badgeText: {
    fontSize: Typography.size['label-caps'],
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default TopRatedBooksScreen;
