export default function StatsPage() {
  return (
    <div className="container" style={{ paddingTop: '52px' }}>
      <p style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--accent-primary)',
        marginBottom: '6px',
      }}>
        Your reading journey
      </p>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
        Statistics
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '40px', fontWeight: 300 }}>
        Coming soon — your reading stats will appear here.
      </p>
    </div>
  );
}
