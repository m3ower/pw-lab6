import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/booksApi';

const BooksContext = createContext(null);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load books from API on mount
  useEffect(() => {
    api.fetchBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function addBook(bookData) {
    const book = await api.createBook(bookData);
    setBooks(prev => [book, ...prev]);
    return book;
  }

  async function updateBook(id, changes) {
    const updated = await api.updateBook(id, changes);
    setBooks(prev => prev.map(b => (b.id === id ? updated : b)));
  }

  async function deleteBook(id) {
    await api.deleteBook(id);
    setBooks(prev => prev.filter(b => b.id !== id));
  }

  async function toggleLike(id) {
    const book = books.find(b => b.id === id);
    if (book) await updateBook(id, { liked: !book.liked });
  }

  // ── Chapters ─────────────────────────────────────────────
  async function addChapter(bookId, chapterData) {
    const chapter = await api.createChapter(bookId, chapterData);
    setBooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, chapters: [...(b.chapters ?? []), chapter] } : b
    ));
    return chapter;
  }

  async function updateChapter(bookId, chapterId, changes) {
    const updated = await api.updateChapter(bookId, chapterId, changes);
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: b.chapters.map(c => (c.id === chapterId ? updated : c)) }
        : b
    ));
  }

  async function deleteChapter(bookId, chapterId) {
    await api.deleteChapter(bookId, chapterId);
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, chapters: b.chapters.filter(c => c.id !== chapterId) }
        : b
    ));
  }

  async function toggleChapterRead(bookId, chapterId) {
    const book = books.find(b => b.id === bookId);
    const chapter = book?.chapters.find(c => c.id === chapterId);
    if (chapter) await updateChapter(bookId, chapterId, { isRead: !chapter.isRead });
  }

  // ── Reading sessions (local only) ────────────────────────
  function addSession(bookId, session) {
    setBooks(prev => prev.map(b =>
      b.id === bookId ? { ...b, sessions: [...(b.sessions ?? []), session] } : b
    ));
  }

  function deleteSession(bookId, sessionId) {
    setBooks(prev => prev.map(b =>
      b.id === bookId
        ? { ...b, sessions: (b.sessions ?? []).filter(s => s.id !== sessionId) }
        : b
    ));
  }

  // ── Import/Export ─────────────────────────────────────────
  async function importBooks(incoming, mode) {
    if (mode === 'replace') {
      // Delete all existing books first, then add incoming
      for (const b of books) await api.deleteBook(b.id).catch(() => {});
      for (const b of incoming) await api.createBook(b).catch(() => {});
    } else {
      // Merge: only add books whose id doesn't already exist
      const existingIds = new Set(books.map(b => b.id));
      for (const b of incoming.filter(b => !existingIds.has(b.id)))
        await api.createBook(b).catch(() => {});
    }
    const fresh = await api.fetchBooks();
    setBooks(fresh);
  }

  return (
    <BooksContext.Provider value={{
      books, loading,
      addBook, updateBook, deleteBook, toggleLike,
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
