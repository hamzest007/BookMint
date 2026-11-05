export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: string;
  progress: number;
  currentChapter: number;
  pageCount: number;
  currentPage: number;
  description: string;
  pdfUri?: string;
  content?: string;
  source?: string;
  filename?: string;
  bookmarks?: number[];
  favorites?: boolean;
  notes?: ReaderNote[];
  highlights?: ReaderHighlight[];
  readerSettings?: ReaderSettings;
  chapters?: BookChapter[];
  publishedAt?: string;
  visibility?: 'Private' | 'Public';
  tags?: string;
  aiModel?: string;
  rating?: number;
  isGenerated?: boolean;
  aiChatSavedResponses?: AiChatSavedResponse[];
}

export interface AiChatSavedResponse {
  id: string;
  text: string;
  createdAt: string;
  chapter: number;
}

export interface ReaderNote {
  id: string;
  pageNumber: number;
  text: string;
  createdAt: string;
}

export interface ReaderHighlight {
  id: string;
  pageNumber: number;
  text: string;
  createdAt: string;
}

export interface ReaderSettings {
  fontSize: number;
  theme: 'light' | 'sepia' | 'night';
}

export interface BookChapter {
  title: string;
  page: number;
}

export const featuredBook: Book = {
  id: 'atomic-habits',
  title: 'Atomic Habits',
  author: 'James Clear',
  coverUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBwoy_3LhSTYaP78435ykZSXLBXybtuvvKokZG7Re8wbw8AIWUyXCsCRdB7ifYU97MNwKDumQ_1X9Li8Zf3MyPznSxUdXc1hjsMkUHBK4NH6OVDhhmEqYsglYH_0HZBNYZtt81kUgeT7pB1eOnAUTB0OzW16AffR0joW3Zc8NKZfa82gqKcZm_JgHaFgpdbnnqqCOzUPi3nBp1I4W2f5ic4Jk-YLrEI8R1vnWvYEjiYHWPKW60Zl-PV',
  category: 'Self Development',
  progress: 72,
  currentChapter: 15,
  pageCount: 320,
  currentPage: 124,
  description:
    'A practical book about making small changes that compound into remarkable results. It focuses on systems, identity, and the tiny actions that shape long-term habits.',
  source: 'Library',
};

export const sampleBooks: Book[] = [
  featuredBook,
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0h1S1eI6x4f5Yb7bM4M9cNf2D1bL3G2mJ6vQ3fQmM8xQ5w3m0E6z5c1w3Q9u6g6K2b5R0mXrA6A6D6c2V6QfHkA3j1K6fB8j3M8lH2f5d2Y6P9k0w0E',
    category: 'Science Fiction',
    progress: 41,
    currentChapter: 11,
    pageCount: 496,
    currentPage: 203,
    description: 'An astronaut wakes up alone and must solve a problem that could save Earth.',
    source: 'Trending',
  },
];
