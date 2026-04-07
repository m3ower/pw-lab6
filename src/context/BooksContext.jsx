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
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, liked: !b.liked } : b))
    );
  }

  return (
    <BooksContext.Provider value={{ books, addBook, updateBook, deleteBook, toggleLike }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  return useContext(BooksContext);
}
