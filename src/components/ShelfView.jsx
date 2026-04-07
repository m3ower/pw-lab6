import { useNavigate } from 'react-router-dom';
import './ShelfView.css';

const SPINE_COLORS = [
  '#7B3030', '#3A6741', '#2E5480', '#7B5E2A',
  '#5E3A7B', '#2A6B6B', '#8B4513', '#4A3A7B',
  '#2E6B3A', '#7B2E5E', '#3A5E2E', '#6B2E2E',
];

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return SPINE_COLORS[h % SPINE_COLORS.length];
}

function spineWidth(title = '') {
  // Vary width: short titles = thin spine, long = thicker (32–54px)
  const base = Math.min(Math.max(title.length * 1.4, 32), 54);
  return Math.round(base);
}

const STATUS_DOT = {
  'in-progress': '#F5C842',
  'completed':   '#4CAF50',
  'not-started': 'transparent',
};

export default function ShelfView({ books }) {
  const navigate = useNavigate();

  // Break into rows of ~20 books max so the shelf doesn't run forever
  const BOOKS_PER_ROW = 18;
  const rows = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_ROW) {
    rows.push(books.slice(i, i + BOOKS_PER_ROW));
  }

  return (
    <div className="shelf-view">
      {rows.map((row, ri) => (
        <div key={ri} className="shelf-row">
          <div className="shelf-books">
            {row.map(book => {
              const color = hashColor(book.id);
              const width = spineWidth(book.title);
              return (
                <div
                  key={book.id}
                  className="book-spine"
                  style={{ '--spine-color': color, '--spine-width': `${width}px` }}
                  onClick={() => navigate(`/book/${book.id}`)}
                  title={`${book.title} — ${book.author}`}
                >
                  {/* Status marker tab */}
                  {book.status !== 'not-started' && (
                    <span
                      className="spine-status-tab"
                      style={{ background: STATUS_DOT[book.status] }}
                    />
                  )}

                  {/* Cover image strip if available */}
                  {book.coverImage && (
                    <div className="spine-cover-strip">
                      <img src={book.coverImage} alt="" />
                    </div>
                  )}

                  {/* Title + author */}
                  <div className="spine-text">
                    <span className="spine-title">{book.title}</span>
                    {book.author && <span className="spine-author">{book.author}</span>}
                  </div>

                  {/* Liked heart */}
                  {book.liked && <span className="spine-liked">♥</span>}
                </div>
              );
            })}
          </div>
          <div className="shelf-plank" />
        </div>
      ))}
    </div>
  );
}
