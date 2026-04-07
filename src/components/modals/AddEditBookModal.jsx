import { useEffect, useRef, useState } from 'react';
import { useBooks } from '../../context/BooksContext';
import StarRating from '../ui/StarRating';
import './AddEditBookModal.css';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Science Fiction',
  'Romance', 'Thriller', 'Biography', 'History', 'Self-Help',
  'Philosophy', 'Science', 'Classic Literature', 'Poetry',
  'Contemporary', 'Horror', 'Other',
];

const EMPTY_FORM = {
  title: '',
  author: '',
  genre: [],
  tags: '',
  link: '',
  coverImage: '',
  totalChapters: '',
  chaptersRead: '',
  status: 'not-started',
  dateStarted: '',
  dateFinished: '',
  rating: 0,
  notes: '',
};

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AddEditBookModal({ book, onClose }) {
  const { addBook, updateBook } = useBooks();
  const isEdit = Boolean(book);
  const firstInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (isEdit) {
      return {
        title:         book.title ?? '',
        author:        book.author ?? '',
        genre:         book.genre ?? [],
        tags:          (book.tags ?? []).join(', '),
        link:          book.link ?? '',
        coverImage:    book.coverImage ?? '',
        totalChapters: book.totalChapters ?? '',
        chaptersRead:  book.chaptersRead ?? '',
        status:        book.status ?? 'not-started',
        dateStarted:   book.dateStarted ?? '',
        dateFinished:  book.dateFinished ?? '',
        rating:        book.rating ?? 0,
        notes:         book.notes ?? '',
      };
    }
    return { ...EMPTY_FORM };
  });

  const [errors, setErrors] = useState({});

  // focus first input on open
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  // close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function toggleGenre(g) {
    setForm(prev => ({
      ...prev,
      genre: prev.genre.includes(g)
        ? prev.genre.filter(x => x !== g)
        : [...prev.genre, g],
    }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    // Only send the fields this form controls — never overwrite chapters, liked, id, dateAdded
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      link: form.link.trim() || null,
      coverImage: form.coverImage.trim() || null,
      totalChapters: form.totalChapters ? Number(form.totalChapters) : null,
      chaptersRead: form.status === 'completed'
        ? (form.totalChapters ? Number(form.totalChapters) : (book?.chaptersRead ?? 0))
        : (form.chaptersRead !== '' ? Number(form.chaptersRead) : (book?.chaptersRead ?? 0)),
      status: form.status,
      dateStarted: form.dateStarted || null,
      dateFinished: form.dateFinished || null,
      rating: form.rating || null,
      notes: form.notes.trim() || null,
    };

    if (isEdit) {
      updateBook(book.id, payload);
    } else {
      addBook(payload);
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEdit ? 'Edit Book' : 'Add a Book'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* ── Section: Basic Info ── */}
            <div className="form-section">
              <p className="form-section-label">Basic Information</p>
              <div className="form-row">
                <div className={`form-group form-group--grow ${errors.title ? 'has-error' : ''}`}>
                  <label htmlFor="title">Title <span className="required">*</span></label>
                  <input
                    ref={firstInputRef}
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Crime and Punishment"
                  />
                  {errors.title && <span className="error-msg">{errors.title}</span>}
                </div>
                <div className={`form-group form-group--grow ${errors.author ? 'has-error' : ''}`}>
                  <label htmlFor="author">Author <span className="required">*</span></label>
                  <input
                    id="author"
                    type="text"
                    value={form.author}
                    onChange={e => set('author', e.target.value)}
                    placeholder="e.g. Fyodor Dostoevsky"
                  />
                  {errors.author && <span className="error-msg">{errors.author}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group--grow">
                  <label htmlFor="coverImage">Cover Image URL</label>
                  <input
                    id="coverImage"
                    type="url"
                    value={form.coverImage}
                    onChange={e => set('coverImage', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group form-group--grow">
                  <label htmlFor="link">Book Link</label>
                  <input
                    id="link"
                    type="url"
                    value={form.link}
                    onChange={e => set('link', e.target.value)}
                    placeholder="PDF, Kindle, website..."
                  />
                </div>
              </div>
            </div>

            {/* ── Section: Genre ── */}
            <div className="form-section">
              <p className="form-section-label">Genre</p>
              <div className="genre-grid">
                {GENRES.map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`genre-chip ${form.genre.includes(g) ? 'selected' : ''}`}
                    onClick={() => toggleGenre(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Section: Tags & chapters ── */}
            <div className="form-section">
              <p className="form-section-label">Details</p>
              <div className="form-row">
                <div className="form-group form-group--grow">
                  <label htmlFor="tags">Tags <span className="form-hint">(comma-separated)</span></label>
                  <input
                    id="tags"
                    type="text"
                    value={form.tags}
                    onChange={e => set('tags', e.target.value)}
                    placeholder="e.g. philosophical, classic, russian"
                  />
                </div>
                <div className="form-group form-group--fixed">
                  <label htmlFor="totalChapters">Total Chapters</label>
                  <input
                    id="totalChapters"
                    type="number"
                    min="1"
                    value={form.totalChapters}
                    onChange={e => set('totalChapters', e.target.value)}
                    placeholder="—"
                  />
                </div>
              </div>
            </div>

            {/* ── Section: Reading status ── */}
            <div className="form-section">
              <p className="form-section-label">Reading Status</p>
              <div className="status-options">
                {[
                  { value: 'not-started', label: 'Not Started' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ].map(opt => (
                  <label key={opt.value} className={`status-option ${form.status === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={form.status === opt.value}
                      onChange={() => set('status', opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className="form-row" style={{ marginTop: '14px' }}>
                {(form.status === 'in-progress' || form.status === 'completed') && (
                  <div className="form-group form-group--grow">
                    <label htmlFor="dateStarted">Date Started</label>
                    <input
                      id="dateStarted"
                      type="date"
                      value={form.dateStarted}
                      onChange={e => set('dateStarted', e.target.value)}
                    />
                  </div>
                )}
                {form.status === 'completed' && (
                  <div className="form-group form-group--grow">
                    <label htmlFor="dateFinished">Date Finished</label>
                    <input
                      id="dateFinished"
                      type="date"
                      value={form.dateFinished}
                      onChange={e => set('dateFinished', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {form.status === 'in-progress' && form.totalChapters && (
                <div className="form-group chapters-read-group" style={{ marginTop: '14px' }}>
                  <label htmlFor="chaptersRead">Chapters Read</label>
                  <div className="chapters-read-input-wrap">
                    <button
                      type="button"
                      className="ch-step-btn"
                      onClick={() => set('chaptersRead', Math.max(0, (Number(form.chaptersRead) || 0) - 1))}
                      disabled={(Number(form.chaptersRead) || 0) <= 0}
                    >−</button>
                    <input
                      id="chaptersRead"
                      type="number"
                      min="0"
                      max={form.totalChapters}
                      value={form.chaptersRead}
                      onChange={e => set('chaptersRead', Math.min(Number(form.totalChapters), Math.max(0, Number(e.target.value))))}
                      placeholder="0"
                    />
                    <span className="ch-read-total">of {form.totalChapters}</span>
                    <button
                      type="button"
                      className="ch-step-btn"
                      onClick={() => set('chaptersRead', Math.min(Number(form.totalChapters), (Number(form.chaptersRead) || 0) + 1))}
                      disabled={(Number(form.chaptersRead) || 0) >= Number(form.totalChapters)}
                    >+</button>
                  </div>
                </div>
              )}

              {form.status === 'completed' && (
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Overall Rating</label>
                  <StarRating value={form.rating} onChange={v => set('rating', v)} size="lg" />
                </div>
              )}
            </div>

            {/* ── Section: Notes ── */}
            <div className="form-section">
              <p className="form-section-label">Notes & Review</p>
              <div className="form-group">
                <label htmlFor="notes">General thoughts, review, impressions</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="What did you think of this book overall?"
                  rows={4}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
