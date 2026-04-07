import { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import BookCard from '../components/BookCard';
import AddEditBookModal from '../components/modals/AddEditBookModal';
import './LibraryPage.css';

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function LibraryPage() {
  const { books } = useBooks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  function openAdd() { setEditingBook(null); setModalOpen(true); }
  function openEdit(book) { setEditingBook(book); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingBook(null); }

  return (
    <div className="library-page container">
      <header className="library-header">
        <div>
          <p className="library-eyebrow">Your collection</p>
          <h1>Library</h1>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <PlusIcon /> Add Book
        </button>
      </header>

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-ornament" aria-hidden="true" />
          <h2>Your shelf is empty</h2>
          <p>Start building your reading collection by adding your first book.</p>
          <button className="btn-primary" onClick={openAdd}>
            <PlusIcon /> Add your first book
          </button>
        </div>
      ) : (
        <div className="book-grid">
          {books.map(book => (
            <BookCard key={book.id} book={book} onEdit={openEdit} />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddEditBookModal book={editingBook} onClose={closeModal} />
      )}
    </div>
  );
}
