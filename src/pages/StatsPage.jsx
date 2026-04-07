import { useState } from 'react';
import { useBooks } from '../context/BooksContext';
import { useStats } from '../hooks/useStats';
import { useSettings } from '../hooks/useSettings';
import StarRating from '../components/ui/StarRating';
import './StatsPage.css';

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="stats-section-header">
      <p className="stats-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

export default function StatsPage() {
  const { books } = useBooks();
  const stats = useStats(books);
  const { settings, updateSetting } = useSettings();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(settings.readingGoal));

  const goalPct = Math.min(100, Math.round((stats.completedThisYear / settings.readingGoal) * 100)) || 0;
  const maxMonthCount = Math.max(...stats.months.map(m => m.count), 1);
  const maxGenreCount = Math.max(...stats.genres.map(g => g.count), 1);
  const maxRatingCount = Math.max(...stats.ratingDist.map(r => r.count), 1);

  function saveGoal() {
    const v = parseInt(goalInput, 10);
    if (v > 0) updateSetting('readingGoal', v);
    setEditingGoal(false);
  }

  if (books.length === 0) {
    return (
      <div className="stats-page container">
        <header className="stats-header">
          <p className="library-eyebrow">Overview</p>
          <h1>Statistics</h1>
        </header>
        <div className="stats-empty">
          <div className="empty-ornament" aria-hidden="true" />
          <p>Add some books to your library to see your reading statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page container">
      <header className="stats-header">
        <p className="library-eyebrow">Overview</p>
        <h1>Statistics</h1>
      </header>

      {/* ── Overview cards ── */}
      <div className="stat-cards">
        <StatCard label="Total Books"    value={stats.total} />
        <StatCard label="Completed"      value={stats.completed} />
        <StatCard label="In Progress"    value={stats.inProgress} />
        <StatCard label="Not Started"    value={stats.notStarted} />
        <StatCard label="Chapters Read"  value={stats.totalChaptersRead} />
        <StatCard label="Favourites"     value={stats.likedCount} />
      </div>

      <div className="stats-grid">

        {/* ── Reading goal ── */}
        <section className="stats-section stats-section--wide">
          <SectionTitle eyebrow={String(new Date().getFullYear())} title="Reading Goal" />
          <div className="goal-block">
            <div className="goal-numbers">
              <span className="goal-current">{stats.completedThisYear}</span>
              <span className="goal-sep">/</span>
              {editingGoal ? (
                <input
                  className="goal-input"
                  type="number"
                  min="1"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  onBlur={saveGoal}
                  onKeyDown={e => e.key === 'Enter' && saveGoal()}
                  autoFocus
                />
              ) : (
                <button className="goal-target" onClick={() => { setGoalInput(String(settings.readingGoal)); setEditingGoal(true); }}>
                  {settings.readingGoal}
                </button>
              )}
              <span className="goal-unit">books this year</span>
            </div>
            <div className="goal-bar-wrap">
              <div className="goal-bar">
                <div className="goal-bar-fill" style={{ width: `${goalPct}%` }} />
              </div>
              <span className="goal-pct">{goalPct}%</span>
            </div>
            {goalPct >= 100 && (
              <p className="goal-done">Goal reached — well done!</p>
            )}
          </div>
        </section>

        {/* ── Average rating ── */}
        {stats.avgRating && (
          <section className="stats-section">
            <SectionTitle eyebrow="Ratings" title="Average Score" />
            <div className="avg-rating-block">
              <span className="avg-rating-number">{stats.avgRating}</span>
              <StarRating value={Math.round(Number(stats.avgRating))} readOnly size="lg" />
              <span className="avg-rating-sub">across {stats.completed} completed book{stats.completed !== 1 ? 's' : ''}</span>
            </div>
            <div className="rating-dist">
              {stats.ratingDist.map(({ star, count }) => (
                <div key={star} className="rating-dist-row">
                  <span className="rating-dist-label">{star}★</span>
                  <div className="rating-dist-bar-wrap">
                    <div
                      className="rating-dist-bar"
                      style={{ width: maxRatingCount > 0 ? `${(count / maxRatingCount) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="rating-dist-count">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Monthly activity ── */}
        <section className="stats-section stats-section--wide">
          <SectionTitle eyebrow={String(new Date().getFullYear())} title="Monthly Activity" />
          <div className="bar-chart">
            {stats.months.map(({ label, count }) => (
              <div key={label} className="bar-col">
                <span className="bar-count">{count > 0 ? count : ''}</span>
                <div className="bar-wrap">
                  <div
                    className="bar"
                    style={{ height: `${(count / maxMonthCount) * 100}%` }}
                    title={`${count} book${count !== 1 ? 's' : ''}`}
                  />
                </div>
                <span className="bar-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Genres ── */}
        {stats.genres.length > 0 && (
          <section className="stats-section">
            <SectionTitle eyebrow="Collection" title="Top Genres" />
            <div className="genre-bars">
              {stats.genres.map(({ name, count }) => (
                <div key={name} className="genre-bar-row">
                  <span className="genre-bar-label">{name}</span>
                  <div className="genre-bar-track">
                    <div
                      className="genre-bar-fill"
                      style={{ width: `${(count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                  <span className="genre-bar-count">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Top authors ── */}
        {stats.topAuthors.length > 0 && (
          <section className="stats-section">
            <SectionTitle eyebrow="Collection" title="Top Authors" />
            <ol className="authors-list">
              {stats.topAuthors.map(({ name, count }, i) => (
                <li key={name} className="author-row">
                  <span className="author-rank">{i + 1}</span>
                  <span className="author-name">{name}</span>
                  <span className="author-count">{count} book{count !== 1 ? 's' : ''}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

      </div>
    </div>
  );
}
