import { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import StarRating from './ui/StarRating';
import './ChapterAccordion.css';

function ChevronIcon({ open }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '200ms ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
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

function QuoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ChapterItem({ chapter, bookId, onEdit }) {
  const [open, setOpen] = useState(false);
  const { toggleChapterRead, deleteChapter } = useBooks();

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete notes for chapter ${chapter.number}?`)) {
      deleteChapter(bookId, chapter.id);
    }
  }

  function handleEdit(e) {
    e.stopPropagation();
    onEdit(chapter);
  }

  function handleToggleRead(e) {
    e.stopPropagation();
    toggleChapterRead(bookId, chapter.id);
  }

  const hasContent = chapter.notes || chapter.quotes?.length > 0 || chapter.questions;

  return (
    <div className={`chapter-item ${open ? 'open' : ''} ${chapter.isRead ? 'is-read' : ''}`}>
      <div className="chapter-header" onClick={() => setOpen(o => !o)}>
        <div className="chapter-header-left">
          <button
            className={`read-dot ${chapter.isRead ? 'read' : ''}`}
            onClick={handleToggleRead}
            title={chapter.isRead ? 'Mark as unread' : 'Mark as read'}
            aria-label={chapter.isRead ? 'Mark as unread' : 'Mark as read'}
          />
          <div className="chapter-title-group">
            <span className="chapter-label">
              Chapter {chapter.number}
              {chapter.name && <span className="chapter-name"> — {chapter.name}</span>}
            </span>
            <div className="chapter-meta">
              {chapter.dateRead && <span>{formatDate(chapter.dateRead)}</span>}
              {chapter.rating > 0 && <StarRating value={chapter.rating} readOnly size="sm" />}
              {!hasContent && <span className="no-content-hint">No notes yet</span>}
            </div>
          </div>
        </div>

        <div className="chapter-header-right">
          <button className="ch-action-btn" onClick={handleEdit} aria-label="Edit chapter">
            <EditIcon />
          </button>
          <button className="ch-action-btn ch-delete-btn" onClick={handleDelete} aria-label="Delete chapter">
            <TrashIcon />
          </button>
          {hasContent && <ChevronIcon open={open} />}
        </div>
      </div>

      {open && hasContent && (
        <div className="chapter-body">
          {chapter.notes && (
            <div className="ch-section">
              <p className="ch-section-label">Notes</p>
              <p className="ch-text">{chapter.notes}</p>
            </div>
          )}

          {chapter.quotes?.filter(q => q.trim()).length > 0 && (
            <div className="ch-section">
              <p className="ch-section-label">Quotes</p>
              <div className="ch-quotes">
                {chapter.quotes.filter(q => q.trim()).map((q, i) => (
                  <blockquote key={i} className="ch-quote">
                    <span className="ch-quote-icon"><QuoteIcon /></span>
                    {q}
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {chapter.questions && (
            <div className="ch-section">
              <p className="ch-section-label">Questions & Reactions</p>
              <p className="ch-text">{chapter.questions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChapterAccordion({ chapters, bookId, onEdit }) {
  const sorted = [...(chapters ?? [])].sort((a, b) => a.number - b.number);

  if (sorted.length === 0) return null;

  return (
    <div className="chapter-accordion">
      {sorted.map(ch => (
        <ChapterItem key={ch.id} chapter={ch} bookId={bookId} onEdit={onEdit} />
      ))}
    </div>
  );
}
