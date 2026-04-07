import { createContext, useContext, useEffect, useState } from 'react';

const BooksContext = createContext(null);
const STORAGE_KEY = 'shelf-books';

export function BooksProvider({ children }) {
  const [books, setBooks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  function addBook(bookData) {
    const book = {
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
      liked: false,
      chapters: [],
      ...bookData,
    };
    setBooks(prev => [book, ...prev]);
    return book;
  }

  function updateBook(id, changes) {
    setBooks(prev => prev.map(b => (b.id === id ? { ...b, ...changes } : b)));
  }

  function deleteBook(id) {
    setBooks(prev => prev.filter(b => b.id !== id));
  }

  function toggleLike(id) {
    setBooks(prev => prev.map(b => (b.id === id ? { ...b, liked: !b.liked } : b)));
  }

  // ── Chapter operations ──────────────────────────────────────
  function addChapter(bookId, chapterData) {
    const chapter = {
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
      isRead: false,
      quotes: [],
      ...chapterData,
    };
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: [...(b.chapters ?? []), chapter] }
        : b
    ));
    return chapter;
  }

  function updateChapter(bookId, chapterId, changes) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: b.chapters.map(c => c.id === chapterId ? { ...c, ...changes } : c) }
        : b
    ));
  }

  function deleteChapter(bookId, chapterId) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: b.chapters.filter(c => c.id !== chapterId) }
        : b
    ));
  }

  function toggleChapterRead(bookId, chapterId) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: b.chapters.map(c => c.id === chapterId ? { ...c, isRead: !c.isRead } : c) }
        : b
    ));
  }

  // ── Reading session operations ───────────────────────────────
  function addSession(bookId, session) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, sessions: [...(b.sessions ?? []), session] }
        : b
    ));
  }

  function deleteSession(bookId, sessionId) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, sessions: (b.sessions ?? []).filter(s => s.id !== sessionId) }
        : b
    ));
  }

  function importBooks(incoming, mode) {
    if (mode === 'replace') {
      setBooks(incoming);
    } else {
      // merge: keep existing books, add incoming ones that don't share an id
      setBooks(prev => {
        const existingIds = new Set(prev.map(b => b.id));
        const newBooks = incoming.filter(b => !existingIds.has(b.id));
        return [...prev, ...newBooks];
      });
    }
  }

  return (
    <BooksContext.Provider value={{
      books, addBook, updateBook, deleteBook, toggleLike,
      addChapter, updateChapter, deleteChapter, toggleChapterRead,
      addSession, deleteSession, importBooks,
    }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}
