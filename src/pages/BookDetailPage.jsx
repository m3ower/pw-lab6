import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooks } from '../context/BooksContext';
import StarRating from '../components/ui/StarRating';
import ChapterAccordion from '../components/ChapterAccordion';
import AddEditBookModal from '../components/modals/AddEditBookModal';
import AddEditChapterModal from '../components/modals/AddEditChapterModal';
import './BookDetailPage.css';

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed':   'Completed',
};

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CoverPlaceholder({ title }) {
  return (
    <div className="detail-cover-placeholder">
      <span className="detail-cover-initial">{title?.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, toggleLike, updateBook } = useBooks();

  const book = books.find(b => b.id === id);

  const [editBookOpen, setEditBookOpen]       = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter]   = useState(null);

  if (!book) {
    return (
      <div className="container" style={{ paddingTop: '52px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Book not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
          ← Back to Library
        </button>
      </div>
    );
  }

  const chaptersRead = book.status === 'completed'
    ? (book.totalChapters ?? 0)
    : (book.chaptersRead ?? 0);
  const progress = book.totalChapters > 0
    ? Math.round((chaptersRead / book.totalChapters) * 100)
    : null;

  function changeChaptersRead(delta) {
    const next = Math.min(
      book.totalChapters ?? Infinity,
      Math.max(0, (book.chaptersRead ?? 0) + delta)
    );
    updateBook(book.id, { chaptersRead: next });
  }

  function openEditChapter(chapter) { setEditingChapter(chapter); setChapterModalOpen(true); }
  function openAddChapter()          { setEditingChapter(null);    setChapterModalOpen(true); }
  function closeChapterModal()       { setChapterModalOpen(false); setEditingChapter(null); }

  return (
    <div className="book-detail-page container">
      {/* Back */}
      <button className="back-btn btn-ghost" onClick={() => navigate('/')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Library
      </button>

      {/* ── Book header ── */}
      <div className="book-detail-header">
        <div className="book-detail-cover">
          {book.coverImage
            ? <img src={book.coverImage} alt={book.title} />
            : <CoverPlaceholder title={book.title} />}
        </div>

        <div className="book-detail-info">
          <span className={`status-pill status-pill--${book.status}`}>
            {STATUS_LABELS[book.status]}
          </span>

          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">{book.author}</p>

          {book.genre?.length > 0 && (
            <div className="detail-genres">
              {book.genre.map(g => <span key={g} className="detail-genre-tag">{g}</span>)}
            </div>
          )}

          {book.tags?.length > 0 && (
            <div className="detail-tags">
              {book.tags.map(t => <span key={t} className="detail-tag">#{t}</span>)}
            </div>
          )}

          {/* Progress */}
          {progress !== null && (
            <div className="detail-progress">
              <div className="detail-progress-bar">
                <div className="detail-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="detail-progress-controls">
                {book.status !== 'completed' && (
                  <button
                    className="progress-step-btn"
                    onClick={() => changeChaptersRead(-1)}
                    disabled={chaptersRead <= 0}
                    aria-label="One chapter back"
                  >−</button>
                )}
                <span className="detail-progress-label">
                  {chaptersRead} / {book.totalChapters} chapters &nbsp;·&nbsp; {progress}%
                </span>
                {book.status !== 'completed' && (
                  <button
                    className="progress-step-btn"
                    onClick={() => changeChaptersRead(1)}
                    disabled={chaptersRead >= book.totalChapters}
                    aria-label="One chapter forward"
                  >+</button>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {book.rating > 0 && (
            <StarRating value={book.rating} readOnly size="lg" />
          )}

          {/* Dates */}
          <div className="detail-dates">
            {book.dateAdded && <span>Added {formatDate(book.dateAdded)}</span>}
            {book.dateStarted && <span>Started {formatDate(book.dateStarted)}</span>}
            {book.dateFinished && <span>Finished {formatDate(book.dateFinished)}</span>}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            {book.link && (
              <a href={book.link} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <LinkIcon /> Open Book
              </a>
            )}
            <button className="btn-ghost" onClick={() => setEditBookOpen(true)}>
              <EditIcon /> Edit
            </button>
            <button
              className={`btn-ghost like-btn ${book.liked ? 'liked' : ''}`}
              onClick={() => toggleLike(book.id)}
            >
              <HeartIcon filled={book.liked} />
              {book.liked ? 'Liked' : 'Like'}
            </button>
          </div>
        </div>
      </div>

      {/* ── General notes ── */}
      {book.notes && (
        <section className="detail-section">
          <h2 className="detail-section-title">Review & Notes</h2>
          <p className="detail-notes-text">{book.notes}</p>
        </section>
      )}

      {/* ── Chapter notes ── */}
      <section className="detail-section">
        <div className="chapters-header">
          <h2 className="detail-section-title">Chapter Notes</h2>
          <button className="btn-primary" onClick={openAddChapter}>
            <PlusIcon /> Add Chapter Note
          </button>
        </div>

        {book.chapters?.length === 0 || !book.chapters ? (
          <div className="chapters-empty">
            <p>No chapter notes yet. Start tracking your reading chapter by chapter.</p>
          </div>
        ) : (
          <ChapterAccordion
            chapters={book.chapters}
            bookId={book.id}
            onEdit={openEditChapter}
          />
        )}
      </section>

      {/* Modals */}
      {editBookOpen && (
        <AddEditBookModal book={book} onClose={() => setEditBookOpen(false)} />
      )}
      {chapterModalOpen && (
        <AddEditChapterModal bookId={book.id} chapter={editingChapter} onClose={closeChapterModal} />
      )}
    </div>
  );
}
