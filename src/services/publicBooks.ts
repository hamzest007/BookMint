import type { Book } from 'src/data/books';
import { apiService } from './api';

export const isPublicBooksBackendReady = () => true; // Always ready with new backend

export const fetchPublicBooks = async (): Promise<Book[]> => {
  try {
    const response = await apiService.get('/public-books');
    return response.books;
  } catch (error) {
    console.error('Failed to fetch public books:', error);
    return [];
  }
};

export const publishPublicBook = async (book: Book) => {
  try {
    const response = await apiService.post(`/public-books/${book.id}/publish`, {});
    return { published: true as const };
  } catch (error) {
    console.error('Failed to publish book:', error);
    return { published: false as const };
  }
};
