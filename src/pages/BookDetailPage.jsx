import { useParams, useNavigate } from 'react-router-dom';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '52px' }}>
      <button
        onClick={() => navigate('/')}
        className="btn-ghost"
        style={{ marginBottom: '32px' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Library
      </button>
      <p style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
        Book detail — coming in the next step.
      </p>
    </div>
  );
}
