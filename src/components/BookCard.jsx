import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BooksContext';
import StarRating from './ui/StarRating';
import './BookCard.css';

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed':   'Completed',
};

const STATUS_ORDER = ['not-started', 'in-progress', 'completed'];

function CoverPlaceholder({ title, author }) {
  const initial = title?.charAt(0).toUpperCase() || '?';
  return (
    <div className="cover-placeholder">
      <span className="cover-initial">{initial}</span>
      <span className="cover-title-small">{title}</span>
      {author && <span className="cover-author-small">{author}</span>}
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function BookCard({ book, onEdit }) {
  const { toggleLike, deleteBook, updateBook } = useBooks();
  const navigate = useNavigate();
  const [statusOpen, setStatusOpen] = useState(false);

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Remove "${book.title}" from your library?`)) {
      deleteBook(book.id);
    }
  }

  function handleEdit(e) {
    e.stopPropagation();
    onEdit(book);
  }

  function handleLike(e) {
    e.stopPropagation();
    toggleLike(book.id);
  }

  function handleStatusChange(e, newStatus) {
    e.stopPropagation();
    updateBook(book.id, { status: newStatus });
    setStatusOpen(false);
  }

  function toggleStatusMenu(e) {
    e.stopPropagation();
    setStatusOpen(o => !o);
  }

  const chaptersRead = book.status === 'completed'
    ? (book.totalChapters ?? 0)
    : (book.chaptersRead ?? 0);
  const progress = book.totalChapters > 0
    ? Math.round((chaptersRead / book.totalChapters) * 100)
    : null;

  return (
    <article className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
      <div className="book-cover">
        {book.coverImage
          ? <img src={book.coverImage} alt={book.title} />
          : <CoverPlaceholder title={book.title} author={book.author} />
        }
        <div className="status-badge-wrap">
          <button
            className={`status-badge status-badge--${book.status}`}
            onClick={toggleStatusMenu}
            aria-label="Change status"
            title="Click to change status"
          >
            {STATUS_LABELS[book.status]}
          </button>
          {statusOpen && (
            <>
              <div className="status-backdrop" onClick={e => { e.stopPropagation(); setStatusOpen(false); }} />
              <div className="status-menu">
                {STATUS_ORDER.map(s => (
                  <button
                    key={s}
                    className={`status-menu-item status-menu-item--${s} ${book.status === s ? 'active' : ''}`}
                    onClick={e => handleStatusChange(e, s)}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="book-card-actions">
          <button
            className={`action-btn like-btn ${book.liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={book.liked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={book.liked} />
          </button>
          <button className="action-btn" onClick={handleEdit} aria-label="Edit">
            <EditIcon />
          </button>
          <button className="action-btn delete-btn" onClick={handleDelete} aria-label="Delete">
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>

        {book.rating > 0 && (
          <StarRating value={book.rating} readOnly size="sm" />
        )}

        {progress !== null && (
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{chaptersRead}/{book.totalChapters} ch.</span>
          </div>
        )}

        {book.genre?.length > 0 && (
          <div className="book-genres">
            {book.genre.slice(0, 2).map(g => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
