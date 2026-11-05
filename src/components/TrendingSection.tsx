import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text as RNText } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/tokens';
import BookItem from './BookItem';
import type { Book } from 'src/data/books';

interface TrendingSectionProps {
  books?: Book[];
  onViewAllPress?: () => void;
  onBookPress?: (bookId: string) => void;
  title?: string;
  subtitle?: string;
}

const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGj1eRrHDBNYX7Og3Gg4Dtq_c-3ZNgjjj3zdGCtLEnF621orVuQ6Z-UVKgh0OiDOhb4t14sDH3c3zb8nFuuTDq2pNPIOSnhXgqf_FrNku7T5A-7O9gwXCJ3SlWN6I83oQY6mBb_1lsFy2SHzsNfrcQLW1peMqe4hWQTbsvEMhvByG2b-VNrXuugt9hXMKRNvH7VQAjKySkThFNceSf1Cf5h54tyrCtHnshO0QHxUloPOzmOsYsM155',
    category: 'Science Fiction',
    progress: 0,
    currentChapter: 1,
    pageCount: 0,
    currentPage: 0,
    description: 'An astronaut wakes up alone and must save humanity.',
  },
  {
    id: '2',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgoF-COA063WfFF3bvdzAqUbpoBThUIw2HIuVdMihsb-Fyvj1wFMF_wMiX-6eRlRhD19hLMirS-74t8U26ITL-R-H3fM6Q33gsjspAAMAGjz4iTNRaYtCvtSJJl-Q5nTpKqy1Ofw-3OKHYXtUjWeJP9l15pUlWGsFFa3ZCcyhv4i9O_C1NjlfcvUCLK_Gl9SWf_bMMEuNgR-wgIzWFDjX9rG8Tah4B_snbJOzu_OLYCRrPpj5VL67q',
    category: 'Fiction',
    progress: 0,
    currentChapter: 1,
    pageCount: 0,
    currentPage: 0,
    description: 'A philosophical novel about a shepherd boy seeking his destiny.',
  },
  {
    id: '3',
    title: 'The Innovators',
    author: 'Walter Isaacson',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfQE9vDUzo9p2K6BbLPTaQtXhF7XsBENFbG9KqvqG9aJ23M9Rl458HUCjdJDITPGBJtaMmwELi3UVlSe0R-EekzN6W6xNeG-IoVznPdfv1acS_SyL32EGV3Lb8kBL4SWyU4EkRcENDJe3DxRlYk1Gl9Sk5czk2nRLj8oQqdHuF0MebRS7i1dPfiFCEI79XBSlhfo-IOWfON_YK6F2BUdb5ZWiTkHNO98NsKthdUjdm4TebnuOx3ahI',
    category: 'Non-Fiction',
    progress: 0,
    currentChapter: 1,
    pageCount: 0,
    currentPage: 0,
    description: 'The story of the digital revolution and the people who created it.',
  },
];

const TrendingSection: React.FC<TrendingSectionProps> = ({
  books = defaultBooks,
  onViewAllPress,
  onBookPress,
  title = 'Trending This Week',
  subtitle = 'Popular books worth opening now',
}) => {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <RNText style={styles.sectionIcon}>📈</RNText>
          <View style={styles.subtitleContainer}>
            <RNText style={styles.sectionTitle}>{title}</RNText>
            <RNText style={styles.sectionSubtitle} numberOfLines={3}>{subtitle}</RNText>
          </View>
        </View>

      </View>

      <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress} activeOpacity={0.7}>
        <RNText style={styles.viewAllText}>View All</RNText>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {books.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            onPress={() => onBookPress?.(book.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['stack-lg'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing['stack-sm'],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subtitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sectionIcon: {
    fontSize: 20,
    color: Colors.secondary,
  },
  sectionTitle: {
    fontSize: Typography.size['title-sm'],
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'left',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: Typography.size['label-caps'],
    color: Colors['on-surface-variant'],
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  viewAllText: {
    fontSize: Typography.size['label-caps'],
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row-reverse',
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    paddingRight: Spacing.md,
  },
});

export default TrendingSection;
