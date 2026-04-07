import { useState, useRef } from 'react';
import { useBooks } from '../context/BooksContext';
import { useBookFilters, SORT_OPTIONS } from '../hooks/useBookFilters';
import BookCard from '../components/BookCard';
import ShelfView from '../components/ShelfView';
import AddEditBookModal from '../components/modals/AddEditBookModal';
import './LibraryPage.css';

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const STATUS_TABS = [
  { value: '',              label: 'All' },
  { value: 'not-started',  label: 'Not Started' },
  { value: 'in-progress',  label: 'In Progress' },
  { value: 'completed',    label: 'Completed' },
];

export default function LibraryPage() {
  const { books, importBooks } = useBooks();
  const { filters, set, reset, filtered, allGenres, isFiltered } = useBookFilters(books);

  const currentlyReading = books.filter(b => b.status === 'in-progress');

  const [view, setView] = useState(() => localStorage.getItem('shelf-view') || 'grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  function changeView(v) { setView(v); localStorage.setItem('shelf-view', v); }

  function handleExport() {
    const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `my-shelf-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        const mode = books.length === 0
          ? 'replace'
          : window.confirm(
              `You already have ${books.length} book(s).\n\nOK → Merge (keep existing + add new)\nCancel → Replace all with imported data`
            )
            ? 'merge'
            : 'replace';
        importBooks(data, mode);
        setImportError('');
      } catch {
        setImportError('Could not read file. Make sure it\'s a valid My Shelf backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function openAdd()        { setEditingBook(null); setModalOpen(true); }
  function openEdit(book)   { setEditingBook(book); setModalOpen(true); }
  function closeModal()     { setModalOpen(false); setEditingBook(null); }

  return (
    <div className="library-page container">
      <header className="library-header">
        <div>
          <p className="library-eyebrow">Your collection</p>
          <h1>Library</h1>
        </div>
        <div className="header-right">
          <button className="btn-ghost" onClick={handleExport} title="Export library as JSON">
            Export
          </button>
          <button className="btn-ghost" onClick={() => fileInputRef.current.click()} title="Import library from JSON">
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
          <div className="view-toggle">
            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => changeView('grid')} title="Grid view">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`view-btn ${view === 'shelf' ? 'active' : ''}`} onClick={() => changeView('shelf')} title="Shelf view">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="4" y2="18"/><line x1="9" y1="4" x2="9" y2="18"/>
                <line x1="14" y1="5" x2="14" y2="18"/><line x1="19" y1="3" x2="19" y2="18"/>
                <line x1="2" y1="18" x2="22" y2="18"/>
              </svg>
            </button>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <PlusIcon /> Add Book
          </button>
        </div>
      </header>

      {importError && (
        <p className="import-error">{importError}</p>
      )}

      {currentlyReading.length > 0 && (
        <section className="currently-reading-section">
          <p className="library-eyebrow" style={{ marginBottom: '14px' }}>Currently Reading</p>
          <div className="currently-reading-row">
            {currentlyReading.map(book => (
              <BookCard key={book.id} book={book} onEdit={openEdit} />
            ))}
          </div>
        </section>
      )}

      {books.length > 0 && (
        <div className="library-controls">

          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon"><SearchIcon /></span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, author, tag or notes…"
              value={filters.search}
              onChange={e => set('search', e.target.value)}
            />
            {filters.search && (
              <button className="search-clear" onClick={() => set('search', '')} aria-label="Clear search">×</button>
            )}
          </div>

          {/* Status tabs */}
          <div className="status-tabs">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                className={`status-tab ${filters.status === tab.value ? 'active' : ''}`}
                onClick={() => set('status', tab.value)}
              >
                {tab.label}
                <span className="tab-count">
                  {tab.value === ''
                    ? books.length
                    : books.filter(b => b.status === tab.value).length}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary filters row */}
          <div className="filters-row">
            {/* Genre */}
            <select
              className="filter-select"
              value={filters.genre}
              onChange={e => set('genre', e.target.value)}
            >
              <option value="">All genres</option>
              {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Min rating */}
            <select
              className="filter-select"
              value={filters.minRating}
              onChange={e => set('minRating', Number(e.target.value))}
            >
              <option value={0}>Any rating</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
              <option value={5}>5 stars</option>
            </select>

            {/* Sort */}
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={e => set('sortBy', e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Liked only */}
            <button
              className={`liked-toggle ${filters.likedOnly ? 'active' : ''}`}
              onClick={() => set('likedOnly', !filters.likedOnly)}
              aria-pressed={filters.likedOnly}
            >
              <HeartIcon filled={filters.likedOnly} />
              Favorites
            </button>

            {/* Clear */}
            {isFiltered && (
              <button className="clear-filters" onClick={reset}>
                Clear filters
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="results-count">
            {filtered.length === books.length
              ? `${books.length} book${books.length !== 1 ? 's' : ''}`
              : `${filtered.length} of ${books.length} books`}
          </p>
        </div>
      )}

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-ornament" aria-hidden="true" />
          <h2>Your shelf is empty</h2>
          <p>Start building your reading collection by adding your first book.</p>
          <button className="btn-primary" onClick={openAdd}><PlusIcon /> Add your first book</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-ornament" aria-hidden="true" />
          <h2>No books match</h2>
          <p>Try adjusting your search or filters.</p>
          <button className="btn-ghost" onClick={reset}>Clear all filters</button>
        </div>
      ) : view === 'shelf' ? (
        <ShelfView books={filtered} />
      ) : (
        <div className="book-grid">
          {filtered.map(book => (
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
