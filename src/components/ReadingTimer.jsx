import { useEffect, useRef, useState } from 'react';
import { useBooks } from '../context/BooksContext';
import './ReadingTimer.css';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTotalTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function ReadingTimer({ bookId, sessions = [] }) {
  const { addSession, deleteSession } = useBooks();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  function startSession() {
    startRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
  }

  function stopSession() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const duration = Math.floor((Date.now() - startRef.current) / 1000);
    if (duration < 5) return; // ignore accidental taps
    addSession(bookId, {
      id: crypto.randomUUID(),
      startTime: new Date(startRef.current).toISOString(),
      endTime: new Date().toISOString(),
      duration,
    });
    setElapsed(0);
  }

  const totalSeconds = sessions.reduce((s, r) => s + r.duration, 0);
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  return (
    <div className="reading-timer">
      <div className="timer-main">
        <div className="timer-info">
          <span className="timer-label">Reading Time</span>
          <span className="timer-total">
            {totalSeconds > 0 ? formatTotalTime(totalSeconds) : '—'}
          </span>
          {sessions.length > 0 && (
            <button
              className="timer-history-toggle"
              onClick={() => setShowHistory(v => !v)}
            >
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              {showHistory ? ' ▴' : ' ▾'}
            </button>
          )}
        </div>

        <div className="timer-controls">
          {running && (
            <span className="timer-elapsed">{formatDuration(elapsed)}</span>
          )}
          <button
            className={`timer-btn ${running ? 'timer-btn--stop' : 'timer-btn--start'}`}
            onClick={running ? stopSession : startSession}
          >
            {running ? (
              <>
                <span className="timer-dot" />
                Stop
              </>
            ) : (
              'Start Reading'
            )}
          </button>
        </div>
      </div>

      {showHistory && sessions.length > 0 && (
        <div className="timer-history">
          {sortedSessions.map(s => (
            <div key={s.id} className="timer-session-row">
              <span className="session-date">{formatDate(s.startTime)}</span>
              <span className="session-duration">{formatTotalTime(s.duration)}</span>
              <button
                className="session-delete"
                onClick={() => deleteSession(bookId, s.id)}
                aria-label="Delete session"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
