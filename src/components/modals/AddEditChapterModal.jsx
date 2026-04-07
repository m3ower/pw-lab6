import { useEffect, useRef, useState } from 'react';
import { useBooks } from '../../context/BooksContext';
import StarRating from '../ui/StarRating';
import './AddEditChapterModal.css';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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

const EMPTY_FORM = {
  number: '',
  name: '',
  dateRead: '',
  notes: '',
  quotes: [''],
  questions: '',
  rating: 0,
  isRead: true,
};

export default function AddEditChapterModal({ bookId, chapter, onClose }) {
  const { addChapter, updateChapter } = useBooks();
  const isEdit = Boolean(chapter);
  const firstInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    if (isEdit) {
      return {
        ...EMPTY_FORM,
        ...chapter,
        quotes: chapter.quotes?.length ? chapter.quotes : [''],
      };
    }
    return { ...EMPTY_FORM };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => { firstInputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function setQuote(index, value) {
    setForm(prev => {
      const quotes = [...prev.quotes];
      quotes[index] = value;
      return { ...prev, quotes };
    });
  }

  function addQuote() {
    setForm(prev => ({ ...prev, quotes: [...prev.quotes, ''] }));
  }

  function removeQuote(index) {
    setForm(prev => ({ ...prev, quotes: prev.quotes.filter((_, i) => i !== index) }));
  }

  function validate() {
    const e = {};
    if (!String(form.number).trim()) e.number = 'Chapter number is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    const payload = {
      ...form,
      number: Number(form.number),
      quotes: form.quotes.filter(q => q.trim()),
      rating: form.rating || null,
      dateRead: form.dateRead || null,
      notes: form.notes.trim() || null,
      questions: form.questions.trim() || null,
    };

    if (isEdit) {
      updateChapter(bookId, chapter.id, payload);
    } else {
      addChapter(bookId, payload);
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ch-modal-title">
        <div className="modal-header">
          <h2 id="ch-modal-title">{isEdit ? 'Edit Chapter Note' : 'Add Chapter Note'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* Basic info */}
            <div className="form-section">
              <p className="form-section-label">Chapter</p>
              <div className="form-row">
                <div className={`form-group form-group--fixed ${errors.number ? 'has-error' : ''}`}>
                  <label htmlFor="ch-number">Chapter # <span className="required">*</span></label>
                  <input
                    ref={firstInputRef}
                    id="ch-number"
                    type="number"
                    min="1"
                    value={form.number}
                    onChange={e => set('number', e.target.value)}
                    placeholder="e.g. 1"
                  />
                  {errors.number && <span className="error-msg">{errors.number}</span>}
                </div>
                <div className="form-group form-group--grow">
                  <label htmlFor="ch-name">Chapter Title <span className="form-hint">(optional)</span></label>
                  <input
                    id="ch-name"
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. The Arrival"
                  />
                </div>
                <div className="form-group form-group--fixed">
                  <label htmlFor="ch-date">Date Read</label>
                  <input
                    id="ch-date"
                    type="date"
                    value={form.dateRead}
                    onChange={e => set('dateRead', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row" style={{ alignItems: 'center', gap: '20px' }}>
                <div className="form-group">
                  <label>Rating</label>
                  <StarRating value={form.rating} onChange={v => set('rating', v)} size="md" />
                </div>
                <label className="read-checkbox">
                  <input
                    type="checkbox"
                    checked={form.isRead}
                    onChange={e => set('isRead', e.target.checked)}
                  />
                  Mark as read
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <p className="form-section-label">Notes & Thoughts</p>
              <div className="form-group">
                <label htmlFor="ch-notes">What happened? What did you think?</label>
                <textarea
                  id="ch-notes"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Your thoughts, reactions, summary..."
                  rows={4}
                />
              </div>
            </div>

            {/* Quotes */}
            <div className="form-section">
              <p className="form-section-label">Key Quotes</p>
              <div className="quotes-list">
                {form.quotes.map((q, i) => (
                  <div key={i} className="quote-row">
                    <input
                      type="text"
                      value={q}
                      onChange={e => setQuote(i, e.target.value)}
                      placeholder={`"A memorable quote from this chapter..."`}
                      className="quote-input"
                    />
                    {form.quotes.length > 1 && (
                      <button type="button" className="quote-remove" onClick={() => removeQuote(i)} aria-label="Remove quote">
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-ghost quote-add" onClick={addQuote}>
                  <PlusIcon /> Add quote
                </button>
              </div>
            </div>

            {/* Questions */}
            <div className="form-section">
              <p className="form-section-label">Questions & Reactions</p>
              <div className="form-group">
                <label htmlFor="ch-questions">Anything that puzzled you or sparked a reaction?</label>
                <textarea
                  id="ch-questions"
                  value={form.questions}
                  onChange={e => set('questions', e.target.value)}
                  placeholder="Questions to follow up on, things that surprised you..."
                  rows={3}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
