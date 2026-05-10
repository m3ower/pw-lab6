const { randomUUID } = require('crypto');

// ── Seed data ────────────────────────────────────────────────
let books = [
  {
    id: randomUUID(),
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    status: 'reading',
    rating: 5,
    liked: true,
    totalChapters: 92,
    chaptersRead: 40,
    dateAdded: new Date().toISOString(),
    chapters: [],
    sessions: [],
  },
  {
    id: randomUUID(),
    title: 'Dune',
    author: 'Frank Herbert',
    status: 'completed',
    rating: 5,
    liked: true,
    totalChapters: 48,
    chaptersRead: 48,
    dateAdded: new Date().toISOString(),
    chapters: [],
    sessions: [],
  },
];

// ── Books ────────────────────────────────────────────────────
function getBooks()  { return books; }
function getBook(id) { return books.find(b => b.id === id) ?? null; }

function createBook(data) {
  const book = {
    id: randomUUID(),
    dateAdded: new Date().toISOString(),
    liked: false,
    chapters: [],
    sessions: [],
    ...data,
  };
  books.unshift(book);
  return book;
}

function updateBook(id, changes) {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return null;
  books[idx] = { ...books[idx], ...changes, id };
  return books[idx];
}

function deleteBook(id) {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return false;
  books.splice(idx, 1);
  return true;
}

// ── Chapters ─────────────────────────────────────────────────
function getChapters(bookId) {
  return getBook(bookId)?.chapters ?? null;
}

function getChapter(bookId, chapterId) {
  return getBook(bookId)?.chapters.find(c => c.id === chapterId) ?? null;
}

function createChapter(bookId, data) {
  const book = getBook(bookId);
  if (!book) return null;
  const chapter = {
    id: randomUUID(),
    dateAdded: new Date().toISOString(),
    isRead: false,
    quotes: [],
    ...data,
  };
  book.chapters.push(chapter);
  return chapter;
}

function updateChapter(bookId, chapterId, changes) {
  const book = getBook(bookId);
  if (!book) return null;
  const idx = book.chapters.findIndex(c => c.id === chapterId);
  if (idx === -1) return null;
  book.chapters[idx] = { ...book.chapters[idx], ...changes, id: chapterId };
  return book.chapters[idx];
}

function deleteChapter(bookId, chapterId) {
  const book = getBook(bookId);
  if (!book) return false;
  const idx = book.chapters.findIndex(c => c.id === chapterId);
  if (idx === -1) return false;
  book.chapters.splice(idx, 1);
  return true;
}

module.exports = {
  getBooks, getBook, createBook, updateBook, deleteBook,
  getChapters, getChapter, createChapter, updateChapter, deleteChapter,
};
