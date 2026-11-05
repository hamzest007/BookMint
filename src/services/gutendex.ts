import type { Book } from 'src/data/books';

export interface GutendexAuthor {
  name: string;
}

export interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  formats: Record<string, string>;
  languages: string[];
  subjects?: string[];
  bookshelves?: string[];
  download_count?: number;
  summaries?: string[];
}

interface GutendexResponse {
  results: GutendexBook[];
  next: string | null;
  previous: string | null;
  count: number;
}

const GUTENDEX_BASE_URL = 'https://gutendex.com/books';

// Open Library API interfaces
interface OpenLibraryAuthor {
  name: string;
}

interface OpenLibraryBook {
  key: string;
  title: string;
  authors?: OpenLibraryAuthor[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  language?: string[];
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
  numFound: number;
  start: number;
}

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json';

const stripProjectGutenbergHeader = (text: string) => {
  const startMarkers = [
    /\*\*\* START OF (THIS|THE) PROJECT GUTENBERG EBOOK [\s\S]*?\*\*\*/i,
    /\*\*\*START OF (THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i,
  ];

  const endMarkers = [
    /\*\*\* END OF (THIS|THE) PROJECT GUTENBERG EBOOK [\s\S]*?$/i,
    /\*\*\*END OF (THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?$/i,
  ];

  let cleaned = text;

  for (const marker of startMarkers) {
    const match = cleaned.match(marker);
    if (match && match.index !== undefined) {
      cleaned = cleaned.slice(match.index + match[0].length);
      break;
    }
  }

  for (const marker of endMarkers) {
    const match = cleaned.match(marker);
    if (match && match.index !== undefined) {
      cleaned = cleaned.slice(0, match.index);
      break;
    }
  }

  return cleaned.trim();
};

const getPlainTextUrl = (formats: Record<string, string>) =>
  formats['text/plain; charset=utf-8'] ||
  formats['text/plain; charset=us-ascii'] ||
  formats['text/plain'] ||
  '';

const getGutenbergPlainTextUrl = (id: number) =>
  `https://www.gutenberg.org/files/${id}/${id}-0.txt`;

export const fetchOnlineBooks = async (limit: number = 8): Promise<Book[]> => {
  console.log('fetchOnlineBooks called with limit:', limit);
  const allBooks: GutendexBook[] = [];
  let nextUrl: string | null = `${GUTENDEX_BASE_URL}?languages=en&mime_type=text%2Fplain&copyright=false&sort=popular`;

  while (nextUrl && allBooks.length < limit) {
    console.log('Fetching from:', nextUrl);
    try {
      const response = await fetch(nextUrl);
      const data: GutendexResponse = await response.json();
      console.log('Fetched', data.results.length, 'books from this page');

      allBooks.push(...data.results);
      nextUrl = data.next;

      // Stop if we've reached the limit
      if (allBooks.length >= limit) {
        break;
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      break;
    }
  }

  console.log('Total books fetched:', allBooks.length);

  const popularBooks = allBooks
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
    .slice(0, limit);

  console.log('Returning', popularBooks.length, 'popular books');

  return popularBooks.map((item) => {
    const plainTextUrl = getGutenbergPlainTextUrl(item.id) || getPlainTextUrl(item.formats);
    const author = item.authors[0]?.name ?? 'Unknown author';
    const coverUrl = `https://www.gutenberg.org/cache/epub/${item.id}/pg${item.id}.cover.medium.jpg`;

    // Use the first summary if available, otherwise use first subject
    const description = item.summaries?.[0] || item.subjects?.[0] || 'Public domain book available to read online.';

    // Use bookshelves for category if available, otherwise use first subject
    const category = item.bookshelves?.[0]?.replace('Category: ', '') || item.subjects?.[0] || 'Online';

    return {
      id: `gutendex-${item.id}`,
      title: item.title,
      author,
      coverUrl,
      category,
      progress: 0,
      currentChapter: 1,
      pageCount: 0,
      currentPage: 1,
      description,
      source: 'Gutendex',
      filename: plainTextUrl,
      rating: item.download_count ?? 0,
      tags: item.subjects?.slice(0, 3).join(', ') || '',
    };
  });
};

export const fetchOnlineBookByTitle = async (title: string) => {
  const response = await fetch(
    `${GUTENDEX_BASE_URL}?search=${encodeURIComponent(title)}&languages=en&mime_type=text%2Fplain&copyright=false`,
  );
  const data: GutendexResponse = await response.json();
  return data.results[0];
};

export const fetchOnlineBookContent = async (book: Book) => {
  if (!book.filename) {
    throw new Error('This book does not have a readable online text URL.');
  }

  const response = await fetch(book.filename);
  const rawText = await response.text();
  return stripProjectGutenbergHeader(rawText);
};

export const fetchOnlineBookContentByTitle = async (title: string) => {
  const book = await fetchOnlineBookByTitle(title);
  if (!book) {
    throw new Error('No online book matched this title.');
  }

  const plainTextUrl = getGutenbergPlainTextUrl(book.id) || getPlainTextUrl(book.formats);
  if (!plainTextUrl) {
    throw new Error('Matched book does not have a plain text URL.');
  }

  const response = await fetch(plainTextUrl);
  const rawText = await response.text();
  return stripProjectGutenbergHeader(rawText);
};

// Open Library API functions
export const fetchOpenLibraryBooks = async (limit: number = 20): Promise<Book[]> => {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_BASE_URL}?q=language:eng&has_fulltext:true&fields=key,title,author_name,first_publish_year,cover_i,subject,language&limit=${limit}`
    );

    if (!response.ok) {
      console.error('Open Library API error:', response.status, response.statusText);
      return [];
    }

    const text = await response.text();
    const data: OpenLibraryResponse = JSON.parse(text);

    return data.docs.map((item) => {
      const author = item.authors?.[0]?.name ?? 'Unknown author';
      const coverUrl = item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
        : '';

      return {
        id: `openlibrary-${item.key.replace('/works/', '')}`,
        title: item.title,
        author,
        coverUrl,
        category: item.subject?.[0] || 'General',
        progress: 0,
        currentChapter: 1,
        pageCount: 0,
        currentPage: 1,
        description: `Published ${item.first_publish_year || 'unknown year'}`,
        source: 'Open Library',
        filename: '', // Open Library books need separate content fetching
        rating: 0,
      };
    });
  } catch (error) {
    console.error('Error fetching Open Library books:', error);
    return [];
  }
};

// Combined function to fetch books from multiple sources
export const fetchAllOnlineBooks = async (limit: number = 100): Promise<Book[]> => {
  console.log('Using Gutendex only (Open Library API disabled due to 500 errors)');
  return fetchOnlineBooks(limit);
};
