import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Book } from '../data/books';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

// Reactotron for debugging
const tron = (console as any).tron;

const BOOKS_STORAGE_KEY = '@bookmint_books';

interface BookContextType {
  books: Book[];
  addBook: (book: Book) => Promise<void>;
  uploadBook: (file: any, metadata: any) => Promise<void>;
  updateBookProgress: (bookId: string, progress: number, currentPage: number) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  toggleBookmark: (bookId: string, pageNumber: number) => Promise<void>;
  removeBookmark: (bookId: string, pageNumber: number) => Promise<void>;
  toggleFavorite: (bookId: string) => Promise<void>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadBooks();
    }
  }, [isAuthenticated, authLoading]);

  const loadBooks = async () => {
    try {
      if (tron) {
        tron.log('Loading books...');
      }
      // Ensure token is loaded from AsyncStorage
      const token = await AsyncStorage.getItem('@bookmint_token');
      if (token) {
        apiService.setToken(token);
      }

      const response = await apiService.get('/books');
      setBooks(response.books);

      // Cache locally for offline access
      const booksJson = JSON.stringify(response.books);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, booksJson).catch((error) => {
        console.error('Failed to cache books to storage:', error);
      });

      if (tron) {
        tron.log('Books loaded successfully', { count: response.books.length });
      }
    } catch (error) {
      console.error('Failed to load books from API:', error);
      if (tron) {
        tron.error('Failed to load books from API', error);
      }
      // Fallback to local storage
      const storedBooks = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
        if (tron) {
          tron.log('Loaded books from local storage', { count: JSON.parse(storedBooks).length });
        }
      }
    }
  };

  const addBook = async (book: Book) => {
    try {
      if (tron) {
        tron.log('Adding book', { title: book.title });
      }
      const response = await apiService.post('/books', book);
      const updatedBooks = [response.book, ...books];
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });

      if (tron) {
        tron.log('Book added successfully', { book: response.book });
      }
    } catch (error) {
      console.error('Failed to add book:', error);
      if (tron) {
        tron.error('Failed to add book', error);
      }
      throw error;
    }
  };

  const uploadBook = async (file: any, metadata: any) => {
    try {
      if (tron) {
        tron.log('Uploading book', { fileName: file.name, metadata });
      }
      const response = await apiService.upload('/books/upload', file, metadata);
      const updatedBooks = [response.book, ...books];
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });

      if (tron) {
        tron.log('Book uploaded successfully', { book: response.book });
      }
    } catch (error) {
      console.error('Failed to upload book:', error);
      if (tron) {
        tron.error('Failed to upload book', error);
      }
      throw error;
    }
  };

  const updateBookProgress = async (bookId: string, progress: number, currentPage: number) => {
    try {
      if (tron) {
        tron.log('Updating book progress', { bookId, progress, currentPage });
      }
      await apiService.put(`/books/${bookId}/progress`, { progress, currentPage });

      const updatedBooks = books.map(book =>
        book.id === bookId ? { ...book, progress, currentPage } : book
      );
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });

      if (tron) {
        tron.log('Book progress updated successfully');
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      if (tron) {
        tron.error('Failed to update progress (BookContext)', error);
      }
      throw error;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      if (tron) {
        tron.log('Deleting book', { bookId });
      }
      await apiService.delete(`/books/${bookId}`);

      const updatedBooks = books.filter(book => book.id !== bookId);
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });

      if (tron) {
        tron.log('Book deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      if (tron) {
        tron.error('Failed to delete book', error);
      }
      throw error;
    }
  };

  const toggleBookmark = async (bookId: string, pageNumber: number) => {
    try {
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      const isBookmarked = book.bookmarks?.includes(pageNumber);

      if (isBookmarked) {
        await apiService.delete(`/books/${bookId}/bookmarks/${pageNumber}`);
      } else {
        await apiService.post(`/books/${bookId}/bookmarks`, { pageNumber });
      }

      const updatedBooks = books.map(book => {
        if (book.id === bookId) {
          const bookmarks = book.bookmarks || [];
          const newBookmarks = isBookmarked
            ? bookmarks.filter(p => p !== pageNumber)
            : [...bookmarks, pageNumber].sort((a, b) => a - b);
          return { ...book, bookmarks: newBookmarks };
        }
        return book;
      });

      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (bookId: string, pageNumber: number) => {
    try {
      await apiService.delete(`/books/${bookId}/bookmarks/${pageNumber}`);

      const updatedBooks = books.map(book => {
        if (book.id === bookId) {
          const bookmarks = book.bookmarks || [];
          return { ...book, bookmarks: bookmarks.filter(p => p !== pageNumber) };
        }
        return book;
      });

      setBooks(updatedBooks);
      const booksJson = JSON.stringify(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, booksJson).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  };

  const toggleFavorite = async (bookId: string) => {
    try {
      await apiService.put(`/books/${bookId}/favorite`);

      const updatedBooks = books.map(book =>
        book.id === bookId ? { ...book, favorites: !book.favorites } : book
      );
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    try {
      await apiService.put(`/books/${bookId}`, updates);

      const updatedBooks = books.map(book =>
        book.id === bookId ? { ...book, ...updates } : book
      );
      setBooks(updatedBooks);
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks)).catch((error) => {
        console.error('Failed to save books to storage:', error);
      });
    } catch (error) {
      console.error('Failed to update book:', error);
      throw error;
    }
  };

  return (
    <BookContext.Provider value={{ books, addBook, uploadBook, updateBookProgress, deleteBook, toggleBookmark, removeBookmark, toggleFavorite, updateBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
