import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Share,
  Modal,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from 'src/theme/tokens';
import type { Book, ReaderHighlight, ReaderNote, ReaderSettings } from 'src/data/books';
import { useBooks } from 'src/context/BookContext';
import { fetchOnlineBookContent, fetchOnlineBookContentByTitle } from 'src/services/gutendex';
import { BookChatSheet } from 'src/components/BookChatSheet';
import type { AiChatSavedResponse } from 'src/data/books';
import type { ChatScope } from 'src/services/bookChat';

type ReaderTheme = ReaderSettings['theme'];

const splitContentIntoPages = (content: string, charsPerPage: number = 800) => {
  const pages: string[] = [];
  let index = 0;
  while (index < content.length) {
    const end = Math.min(index + charsPerPage, content.length);
    let page = content.slice(index, end);
    if (end < content.length) {
      const lastSpace = page.lastIndexOf(' ');
      if (lastSpace > 0) {
        page = page.slice(0, lastSpace);
        index += lastSpace + 1;
      } else {
        index = end;
      }
    } else {
      index = end;
    }
    pages.push(page.trim());
  }
  return pages;
};

const formatPageParagraphs = (pageContent: string) =>
  pageContent
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(paragraph => paragraph.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

const getThemeStyles = (theme: ReaderTheme) => {
  switch (theme) {
    case 'sepia':
      return { background: '#F5E9D8', surface: '#FFF8EF', text: '#46372C', subtext: '#7B6657', accent: '#8C5D36' };
    case 'night':
      return { background: '#0E1726', surface: '#162233', text: '#F2F6FF', subtext: '#A9B7CF', accent: '#78D6B0' };
    default:
      return { background: Colors.background, surface: Colors['surface-container-lowest'], text: Colors['on-surface'], subtext: Colors['on-surface-variant'], accent: Colors.primary };
  }
};

const defaultSettings: ReaderSettings = { fontSize: 18, theme: 'light' };

interface BookReaderScreenProps {
  route?: {
    params?: {
      book?: Book;
    };
  };
}

const BookReaderScreen: React.FC<BookReaderScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { updateBookProgress, toggleBookmark, removeBookmark, updateBook } = useBooks();
  const book = route?.params?.book;

  const isOnlineBook = book?.source === 'Gutendex' || Boolean(book?.filename);
  const isCustomBook = Boolean(book?.content) && !isOnlineBook;
  const [bookContent, setBookContent] = useState(book?.content ?? '');
  const [isLoadingContent, setIsLoadingContent] = useState(Boolean(isOnlineBook && !book?.content));
  const [currentPage, setCurrentPage] = useState(Math.max(book?.currentPage ?? 1, 1));
  const [totalPages, setTotalPages] = useState(book?.pageCount ?? 0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showBookmarkSheet, setShowBookmarkSheet] = useState(false);
  const [showNotesSheet, setShowNotesSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showTocSheet, setShowTocSheet] = useState(false);
  const [showBookChat, setShowBookChat] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(book?.readerSettings || defaultSettings);
  const [highlightQuery, setHighlightQuery] = useState('');

  const contentPages = useMemo(() => (bookContent ? splitContentIntoPages(bookContent) : []), [bookContent]);
  const activePageContent = contentPages[currentPage - 1] || '';
  const activeParagraphs = useMemo(() => formatPageParagraphs(activePageContent), [activePageContent]);
  const currentBookmarks = book?.bookmarks || [];
  const currentNotes = book?.notes || [];
  const currentHighlights = book?.highlights || [];
  const theme = getThemeStyles(settings.theme);
  const readerTitle = book?.title ?? 'Reader';
  const readerSubtitle = isOnlineBook ? 'Online library edition' : isCustomBook ? 'Your custom edition' : 'Reader';
  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const estimatedWords = Math.max(0, Math.round((bookContent.length || 0) / 5));
  const estimatedMinutesLeft = Math.max(1, Math.ceil(Math.max(0, estimatedWords - Math.round((estimatedWords * progress) / 100)) / 220));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isReading) {
      interval = setInterval(() => setReadingTime(prev => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReading]);

  useEffect(() => {
    if (!isCustomBook) return;
    setTotalPages(contentPages.length);
    setCurrentPage(page => Math.min(Math.max(page, 1), Math.max(contentPages.length, 1)));
  }, [contentPages.length, isCustomBook]);

  useEffect(() => {
    let cancelled = false;
    const loadOnlineContent = async () => {
      if (!isOnlineBook || book?.content) return;
      try {
        setIsLoadingContent(true);
        if (!book) return;
        const loadedContent = book.filename ? await fetchOnlineBookContent(book) : await fetchOnlineBookContentByTitle(book.title);
        if (cancelled) return;
        const trimmed = loadedContent.trim();
        setBookContent(trimmed);
        setTotalPages(Math.max(1, Math.ceil(trimmed.length / 800)));
      } catch {
        if (!cancelled) {
          setBookContent('');
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setIsLoadingContent(false);
      }
    };
    loadOnlineContent();
    return () => {
      cancelled = true;
    };
  }, [book, isOnlineBook]);

  const persistReaderState = (nextPage: number) => {
    if (!book) return;
    const nextProgress = totalPages > 0 ? Math.round((nextPage / totalPages) * 100) : 0;
    updateBookProgress(book.id, nextProgress, nextPage);
    updateBook(book.id, {
      bookmarks: currentBookmarks,
      notes: currentNotes,
      highlights: currentHighlights,
      readerSettings: settings,
    });
  };

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    setCurrentPage(nextPage);
    persistReaderState(nextPage);
  };

  const addBookmark = () => {
    if (!book) return;
    toggleBookmark(book.id, currentPage);
  };

  const deleteBookmark = (pageNumber: number) => {
    if (!book) return;
    removeBookmark(book.id, pageNumber);
  };

  const addNote = () => {
    if (!book || !noteText.trim()) return;
    const nextNotes = editingNoteId
      ? currentNotes.map(note => note.id === editingNoteId ? { ...note, text: noteText.trim() } : note)
      : [{
          id: `note-${Date.now()}`,
          pageNumber: currentPage,
          text: noteText.trim(),
          createdAt: new Date().toISOString(),
        }, ...currentNotes];
    updateBook(book.id, { notes: nextNotes });
    setNoteText('');
    setEditingNoteId(null);
    setShowNotesSheet(false);
  };

  const startEditingNote = (note: ReaderNote) => {
    setEditingNoteId(note.id);
    setCurrentPage(note.pageNumber);
    setNoteText(note.text);
    setShowNotesSheet(true);
  };

  const deleteNote = (noteId: string) => {
    if (!book) return;
    updateBook(book.id, { notes: currentNotes.filter(note => note.id !== noteId) });
  };

  const addHighlight = () => {
    if (!book) return;
    const nextHighlight: ReaderHighlight = {
      id: `highlight-${Date.now()}`,
      pageNumber: currentPage,
      text: activePageContent.trim(),
      createdAt: new Date().toISOString(),
    };
    updateBook(book.id, { highlights: [nextHighlight, ...currentHighlights] });
  };

  const updateReaderSettings = (next: ReaderSettings) => {
    setSettings(next);
    if (book) updateBook(book.id, { readerSettings: next });
  };

  const exportNotesAndHighlights = async () => {
    if (!book) return;
    const notesBlock = currentNotes.length > 0
      ? currentNotes.map(note => `- Page ${note.pageNumber}: ${note.text}`).join('\n')
      : '- No notes yet';
    const highlightsBlock = currentHighlights.length > 0
      ? currentHighlights.map(highlight => `- Page ${highlight.pageNumber}: ${highlight.text}`).join('\n')
      : '- No highlights yet';

    const payload = [
      `${book.title} by ${book.author}`,
      '',
      'Notes',
      notesBlock,
      '',
      'Highlights',
      highlightsBlock,
      '',
      `Exported from Bookmint on ${new Date().toLocaleDateString()}`,
    ].join('\n');

    await Share.share({
      title: `${book.title} notes and highlights`,
      message: payload,
    });
    setShowExportSheet(false);
  };

  const fontSizes = [16, 18, 20, 22];
  const themes: ReaderTheme[] = ['light', 'sepia', 'night'];
  const topBarHeight = insets.top + 58;

  const currentHighlightList = currentHighlights.filter(item =>
    highlightQuery.trim() ? item.text.toLowerCase().includes(highlightQuery.toLowerCase()) : true,
  );
  const tocItems = book?.chapters || [];
  const activeChapter = [...tocItems]
    .filter(chapter => chapter.page <= currentPage)
    .sort((a, b) => b.page - a.page)[0];
  const chapterLabel = activeChapter?.title || `Chapter ${currentPage}`;

  const getBookChatContext = (scope: ChatScope, allowSpoilers: boolean) => {
    if (!bookContent) return '';
    const visiblePages = allowSpoilers ? contentPages : contentPages.slice(0, currentPage);
    let selectedPages: string[];
    if (scope === 'chapter') {
      const chapterStart = activeChapter?.page || currentPage;
      const nextChapter = tocItems
        .filter(chapter => chapter.page > chapterStart)
        .sort((a, b) => a.page - b.page)[0];
      const chapterEnd = nextChapter ? nextChapter.page - 1 : currentPage;
      selectedPages = visiblePages.slice(Math.max(0, chapterStart - 1), Math.min(visiblePages.length, chapterEnd));
      if (!selectedPages.length) selectedPages = [activePageContent];
    } else if (scope === 'previous') {
      selectedPages = visiblePages;
    } else {
      selectedPages = allowSpoilers ? contentPages : visiblePages;
    }
    const fullText = selectedPages.join('\n\n');
    if (fullText.length <= 55000) return fullText;
    return `${fullText.slice(0, 26000)}\n\n[Middle passages omitted for length]\n\n${fullText.slice(-26000)}`;
  };

  const saveChatResponse = (text: string) => {
    if (!book) return;
    const saved: AiChatSavedResponse = {
      id: `ai-response-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      chapter: currentPage,
    };
    updateBook(book.id, { aiChatSavedResponses: [saved, ...(book.aiChatSavedResponses || [])] });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top, height: topBarHeight, backgroundColor: theme.surface }]}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.background }]} onPress={() => navigation.goBack()}>
          <RNText style={[styles.iconGlyph, { color: theme.text }]}>←</RNText>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <RNText style={[styles.bookTitle, { color: theme.subtext }]} numberOfLines={1}>{readerTitle}</RNText>
          <RNText style={[styles.bookSubtitle, { color: theme.accent }]} numberOfLines={1}>{readerSubtitle}</RNText>
        </View>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.background }]} onPress={() => setShowControls(v => !v)}>
          <RNText style={[styles.iconGlyph, { color: theme.text }]}>☰</RNText>
        </TouchableOpacity>
      </View>

      {showControls && (
        <View style={[styles.controlsBar, { top: topBarHeight + 8, backgroundColor: theme.surface }]}>
          <TouchableOpacity style={styles.controlChip} onPress={addBookmark}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>
              {currentBookmarks.includes(currentPage) ? 'Bookmarked' : 'Bookmark'}
            </RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setShowNotesSheet(true)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>Notes</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setShowBookmarkSheet(true)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>Saved</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setShowExportSheet(true)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>Export</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setShowTocSheet(true)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>TOC</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setShowSettingsSheet(true)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>Aa</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlChip, styles.aiChatChip]} onPress={() => setShowBookChat(true)} accessibilityRole="button" accessibilityLabel="Ask AI about this book">
            <RNText style={[styles.controlChipText, { color: Colors.white }]}>✦ Ask AI</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlChip} onPress={() => setIsReading(v => !v)}>
            <RNText style={[styles.controlChipText, { color: theme.text }]}>{isReading ? 'Pause timer' : 'Start timer'}</RNText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={[styles.readerContent, styles.readerContentPadding, { paddingTop: topBarHeight + 90 }]}>
        <View style={[styles.progressCard, { backgroundColor: theme.surface }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressPill}>
              <RNText style={[styles.progressValue, { color: theme.text }]}>{progress}%</RNText>
              <RNText style={[styles.progressLabel, { color: theme.subtext }]}>done</RNText>
            </View>
            <View style={styles.progressPill}>
              <RNText style={[styles.progressValue, { color: theme.text }]}>{readingTime}s</RNText>
              <RNText style={[styles.progressLabel, { color: theme.subtext }]}>time</RNText>
            </View>
            <View style={styles.progressPill}>
              <RNText style={[styles.progressValue, { color: theme.text }]}>{estimatedMinutesLeft}m</RNText>
              <RNText style={[styles.progressLabel, { color: theme.subtext }]}>left</RNText>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${progress}%` }]} />
          </View>
          <RNText style={[styles.progressMeta, { color: theme.subtext }]}>{`Page ${currentPage} of ${totalPages || '?'} • ${readerTitle}`}</RNText>
        </View>

        {isLoadingContent ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={theme.accent} />
            <RNText style={[styles.loadingText, { color: theme.subtext }]}>Loading book...</RNText>
          </View>
        ) : book?.pdfUri ? (
          <View style={styles.pdfContainer}>
            {!pdfLoaded && <ActivityIndicator size="large" color={theme.accent} />}
            <Pdf
              source={{ uri: book.pdfUri }}
              style={styles.pdf}
              onLoadComplete={(pages) => {
                setPdfLoaded(true);
                setTotalPages(pages);
              }}
              onPageChanged={(page) => handlePageChange(page + 1)}
              page={currentPage - 1}
              enablePaging
              spacing={12}
              trustAllCerts={false}
              scale={settings.fontSize / 16}
            />
          </View>
        ) : (
          <View style={styles.textCanvas}>
            <RNText style={[styles.chapterTitle, { color: theme.text }]}>Chapter {currentPage}</RNText>
            <RNText style={[styles.chapterSubtitle, { color: theme.subtext }]}>{`${currentHighlightList.length} highlights, ${currentNotes.length} notes`}</RNText>
            <View style={styles.textBody}>
              {activeParagraphs.length > 0 ? (
                activeParagraphs.map((paragraph, index) => {
                  const matchedHighlight = currentHighlights.find(item => item.text === paragraph);
                  const paragraphStyle = [
                    styles.paragraph,
                    {
                      color: theme.text,
                      fontSize: settings.fontSize,
                      lineHeight: Math.round(settings.fontSize * 1.8),
                      backgroundColor: matchedHighlight ? 'rgba(120, 214, 176, 0.18)' : 'transparent',
                    },
                  ];
                  return (
                    <RNText
                      key={`${currentPage}-${index}`}
                      style={paragraphStyle}
                    onLongPress={addHighlight}
                    >
                      {paragraph}
                    </RNText>
                  );
                })
              ) : (
                <RNText style={[styles.paragraph, { color: theme.text, fontSize: settings.fontSize }]}>
                  No readable text found for this book.
                </RNText>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, paddingBottom: insets.bottom + Spacing.sm }]}>
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <RNText style={[styles.navText, { color: theme.text }]}>Prev</RNText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => handlePageChange(currentPage + 1)} disabled={totalPages > 0 && currentPage >= totalPages}>
            <RNText style={[styles.navText, { color: theme.text }]}>Next</RNText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showBookmarkSheet} transparent animationType="slide" onRequestClose={() => setShowBookmarkSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <RNText style={styles.sheetTitle}>Bookmarks</RNText>
            <ScrollView style={styles.sheetList}>
              {currentBookmarks.length > 0 ? currentBookmarks.map(page => (
                <View key={page} style={styles.bookmarkRow}>
                  <TouchableOpacity style={styles.bookmarkJump} onPress={() => { setCurrentPage(page); setShowBookmarkSheet(false); }}>
                    <RNText style={styles.sheetItemText}>Page {page}</RNText>
                    <RNText style={styles.bookmarkJumpText}>Jump</RNText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bookmarkDelete} onPress={() => deleteBookmark(page)}>
                    <RNText style={styles.bookmarkDeleteText}>Remove</RNText>
                  </TouchableOpacity>
                </View>
              )) : <RNText style={styles.sheetEmpty}>No bookmarks yet.</RNText>}
            </ScrollView>
            <TouchableOpacity style={styles.sheetButton} onPress={() => setShowBookmarkSheet(false)}>
              <RNText style={styles.sheetButtonText}>Close</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotesSheet} transparent animationType="slide" onRequestClose={() => setShowNotesSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <RNText style={styles.sheetTitle}>Notes</RNText>
            <TextInput
              style={styles.searchInput}
              placeholder="Search highlights..."
              placeholderTextColor={Colors['on-surface-variant']}
              value={highlightQuery}
              onChangeText={setHighlightQuery}
            />
              <TextInput
                style={styles.noteInput}
                placeholder={editingNoteId ? 'Edit your note...' : 'Write a note for this page...'}
                placeholderTextColor={theme.subtext}
                value={noteText}
                onChangeText={setNoteText}
                multiline
              />
            <TouchableOpacity style={styles.sheetButton} onPress={addNote}>
              <RNText style={styles.sheetButtonText}>{editingNoteId ? 'Update note' : 'Save note'}</RNText>
            </TouchableOpacity>
            <ScrollView style={styles.sheetList}>
              {currentNotes.filter(note => note.pageNumber === currentPage).map(note => (
                <View key={note.id} style={styles.noteCard}>
                  <RNText style={styles.notePage}>Page {note.pageNumber}</RNText>
                  <RNText style={styles.noteText}>{note.text}</RNText>
                  <View style={styles.noteActions}>
                    <TouchableOpacity onPress={() => startEditingNote(note)} style={styles.noteActionButton}>
                      <RNText style={styles.noteActionText}>Edit</RNText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteNote(note.id)} style={styles.noteActionButton}>
                      <RNText style={[styles.noteActionText, styles.noteActionDelete]}>Delete</RNText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.sheetButtonSecondary} onPress={() => setShowNotesSheet(false)}>
              <RNText style={styles.sheetButtonTextSecondary}>Close</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showExportSheet} transparent animationType="slide" onRequestClose={() => setShowExportSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <RNText style={styles.sheetTitle}>Export</RNText>
            <RNText style={styles.sheetSubtitle}>Share your notes and highlights as a clean text report.</RNText>
            <View style={styles.exportSummary}>
              <View style={styles.exportStat}>
                <RNText style={styles.exportStatValue}>{currentNotes.length}</RNText>
                <RNText style={styles.exportStatLabel}>Notes</RNText>
              </View>
              <View style={styles.exportStat}>
                <RNText style={styles.exportStatValue}>{currentHighlights.length}</RNText>
                <RNText style={styles.exportStatLabel}>Highlights</RNText>
              </View>
              <View style={styles.exportStat}>
                <RNText style={styles.exportStatValue}>{currentBookmarks.length}</RNText>
                <RNText style={styles.exportStatLabel}>Bookmarks</RNText>
              </View>
            </View>
            <TouchableOpacity style={styles.sheetButton} onPress={exportNotesAndHighlights}>
              <RNText style={styles.sheetButtonText}>Share export</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetButtonSecondary} onPress={() => setShowExportSheet(false)}>
              <RNText style={styles.sheetButtonTextSecondary}>Close</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTocSheet} transparent animationType="slide" onRequestClose={() => setShowTocSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <RNText style={styles.sheetTitle}>Table of contents</RNText>
            <ScrollView style={styles.sheetList}>
              {tocItems.length > 0 ? tocItems.map((chapter, index) => (
                <TouchableOpacity
                  key={`${chapter.title}-${index}`}
                  style={styles.sheetItem}
                  onPress={() => {
                    setCurrentPage(chapter.page);
                    setShowTocSheet(false);
                  }}
                >
                  <RNText style={styles.sheetItemText}>{chapter.title}</RNText>
                  <RNText style={styles.sheetEmpty}>Page {chapter.page}</RNText>
                </TouchableOpacity>
              )) : <RNText style={styles.sheetEmpty}>No chapter metadata available.</RNText>}
            </ScrollView>
            <TouchableOpacity style={styles.sheetButtonSecondary} onPress={() => setShowTocSheet(false)}>
              <RNText style={styles.sheetButtonTextSecondary}>Close</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSettingsSheet} transparent animationType="slide" onRequestClose={() => setShowSettingsSheet(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <RNText style={styles.sheetTitle}>Reading settings</RNText>
            <RNText style={styles.sheetSubtitle}>Text size</RNText>
            <View style={styles.optionRow}>
              {fontSizes.map(size => (
                <TouchableOpacity key={size} style={[styles.optionChip, settings.fontSize === size && styles.optionChipActive]} onPress={() => updateReaderSettings({ ...settings, fontSize: size })}>
                  <RNText style={[styles.optionChipText, settings.fontSize === size && styles.optionChipTextActive]}>{size}</RNText>
                </TouchableOpacity>
              ))}
            </View>
            <RNText style={styles.sheetSubtitle}>Theme</RNText>
            <View style={styles.optionRow}>
              {themes.map(item => (
                <TouchableOpacity key={item} style={[styles.optionChip, settings.theme === item && styles.optionChipActive]} onPress={() => updateReaderSettings({ ...settings, theme: item })}>
                  <RNText style={[styles.optionChipText, settings.theme === item && styles.optionChipTextActive]}>{item}</RNText>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.sheetButton} onPress={() => setShowSettingsSheet(false)}>
              <RNText style={styles.sheetButtonText}>Done</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BookChatSheet
        visible={showBookChat}
        onClose={() => setShowBookChat(false)}
        title={readerTitle}
        description={book?.description}
        chapterLabel={chapterLabel}
        getContext={getBookChatContext}
        onSaveResponse={saveChatResponse}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['margin-mobile'],
    borderBottomWidth: 1,
    borderBottomColor: Colors['surface-container-high'],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlyph: { fontSize: 18, fontWeight: '800' },
  titleContainer: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.md },
  bookTitle: { fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '800' },
  bookSubtitle: { marginTop: 2, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '800' },
  controlsBar: {
    position: 'absolute',
    left: Spacing['margin-mobile'],
    right: Spacing['margin-mobile'],
    zIndex: 99,
    borderRadius: 18,
    padding: Spacing.sm,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    ...Shadows.ambient,
  },
  controlChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors['surface-container-high'],
  },
  controlChipText: { fontSize: 12, fontWeight: '800' },
  aiChatChip: { backgroundColor: Colors.primary },
  readerContent: { paddingHorizontal: Spacing['margin-mobile'] },
  readerContentPadding: { paddingBottom: 170 },
  progressCard: { borderRadius: 22, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.ambient },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressPill: { flex: 1, alignItems: 'center' },
  progressValue: { fontSize: 18, fontWeight: '800' },
  progressLabel: { marginTop: 2, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  progressBar: { height: 8, backgroundColor: Colors['surface-container-highest'], borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressMeta: { marginTop: 8, fontSize: 11, textAlign: 'center' },
  loadingContent: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12 },
  textCanvas: { borderRadius: 24, padding: Spacing.lg, backgroundColor: Colors['surface-container-lowest'], ...Shadows.ambient },
  chapterTitle: { fontFamily: Typography.familyDisplay.bold, fontSize: 30, marginBottom: 4 },
  chapterSubtitle: { fontSize: 12, marginBottom: 16 },
  textBody: { gap: 18 },
  paragraph: {
    borderRadius: 14,
    paddingVertical: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors['surface-container-high'],
    paddingHorizontal: Spacing['margin-mobile'],
    paddingTop: Spacing.sm,
  },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, backgroundColor: Colors['surface-container-high'] },
  navText: { fontSize: 13, fontWeight: '800' },
  pdfContainer: { flex: 1, minHeight: 400 },
  pdf: { flex: 1, width: '100%', height: 600 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors['surface-container-lowest'], borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, maxHeight: '70%' },
  sheetTitle: { fontFamily: Typography.familyDisplay.bold, fontSize: 24, color: Colors.primary, marginBottom: 8 },
  sheetSubtitle: { color: Colors['on-surface-variant'], marginTop: 12, marginBottom: 10, fontWeight: '700' },
  sheetList: { maxHeight: 220 },
  sheetItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors['surface-container-high'] },
  sheetItemText: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
  sheetEmpty: { color: Colors['on-surface-variant'], paddingVertical: 12 },
  bookmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors['surface-container-high'] },
  bookmarkJump: { flex: 1 },
  bookmarkJumpText: { color: Colors.secondary, fontSize: 11, fontWeight: '800', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },
  bookmarkDelete: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors['surface-container-high'] },
  bookmarkDeleteText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  sheetButton: { marginTop: 14, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  sheetButtonSecondary: { marginTop: 10, backgroundColor: Colors['surface-container-high'], paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  sheetButtonText: { color: Colors['on-primary'], fontWeight: '800' },
  sheetButtonTextSecondary: { color: Colors.primary, fontWeight: '800' },
  exportSummary: { flexDirection: 'row', gap: 10, marginTop: 14 },
  exportStat: { flex: 1, borderRadius: 16, backgroundColor: Colors['surface-container-low'], padding: 14, alignItems: 'center' },
  exportStatValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  exportStatLabel: { marginTop: 4, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: Colors['on-surface-variant'], fontWeight: '700' },
  searchInput: {
    marginTop: 8,
    marginBottom: 10,
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors['surface-container-high'],
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    color: Colors.primary,
    backgroundColor: Colors['surface-container-low'],
  },
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: Colors['surface-container-high'],
    borderRadius: 16,
    padding: Spacing.md,
    color: Colors.primary,
    backgroundColor: Colors['surface-container-low'],
  },
  noteCard: { padding: Spacing.md, borderRadius: 16, backgroundColor: Colors['surface-container-low'], marginTop: 10 },
  notePage: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.secondary, fontWeight: '800', marginBottom: 6 },
  noteText: { color: Colors.primary, lineHeight: 20 },
  noteActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  noteActionButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: Colors['surface-container-high'] },
  noteActionText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  noteActionDelete: { color: Colors.error },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors['surface-container-high'] },
  optionChipActive: { backgroundColor: Colors.primary },
  optionChipText: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  optionChipTextActive: { color: Colors['on-primary'] },
});

export default BookReaderScreen;
