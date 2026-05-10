import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TokenPage.css';

const API_BASE = 'http://localhost:3001';

const ROLES = [
  {
    name: 'VISITOR',
    icon: '👁',
    description: 'Browse the library. Cannot add, edit, or delete books.',
    permissions: ['READ'],
  },
  {
    name: 'WRITER',
    icon: '✏️',
    description: 'View, add, and edit books. Cannot delete.',
    permissions: ['READ', 'WRITE'],
  },
  {
    name: 'ADMIN',
    icon: '🛡',
    description: 'Full access — view, add, edit, and delete books.',
    permissions: ['READ', 'WRITE', 'DELETE'],
  },
];

export default function TokenPage() {
  const { auth, setToken, clearToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!auth) return;
    const update = () => setSecondsLeft(Math.max(0, Math.floor((auth.expiresAt - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [auth]);

  async function pickRole(role) {
    setLoading(role);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get token');
      setToken(data);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading('');
    }
  }

  return (
    <div className="token-page container">
      <header className="token-header">
        <p className="library-eyebrow">Authentication</p>
        <h1>Get Access Token</h1>
        <p className="token-subtitle">
          Pick a role to receive a JWT (expires in 1 minute).
          Your role determines what you can do in the library.
        </p>
      </header>

      {auth && (
        <div className="current-token-bar">
          <div className="current-token-info">
            <span className={`role-pill role-pill--${auth.role.toLowerCase()}`}>{auth.role}</span>
            <span className="token-perms">{auth.permissions.join(' · ')}</span>
            <span className={`token-timer-text ${secondsLeft < 15 ? 'expiring' : ''}`}>
              expires in {secondsLeft}s
            </span>
          </div>
          <button className="btn-ghost" onClick={clearToken}>Clear token</button>
        </div>
      )}

      {error && <p className="token-error">{error}</p>}

      <div className="role-cards">
        {ROLES.map(role => (
          <button
            key={role.name}
            className={`role-card role-card--${role.name.toLowerCase()} ${auth?.role === role.name ? 'active' : ''}`}
            onClick={() => pickRole(role.name)}
            disabled={!!loading}
          >
            <span className="role-card-icon">{role.icon}</span>
            <h2 className="role-card-name">{role.name}</h2>
            <p className="role-card-desc">{role.description}</p>
            <div className="role-card-perms">
              {role.permissions.map(p => (
                <span key={p} className={`perm-tag perm-tag--${p.toLowerCase()}`}>{p}</span>
              ))}
            </div>
            {loading === role.name && <span className="role-card-loading">Getting token…</span>}
            {auth?.role === role.name && <span className="role-card-active-badge">Active</span>}
          </button>
        ))}
      </div>

      <div className="token-api-box">
        <h3>API reference</h3>
        <p>You can also request a token directly from the API:</p>
        <pre><code>POST http://localhost:3001/token{'\n'}{"{"} "role": "ADMIN" {"}"}</code></pre>
        <pre><code>GET  http://localhost:3001/token?role=ADMIN</code></pre>
        <a
          className="swagger-link"
          href="http://localhost:3001/api-docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Swagger UI →
        </a>
      </div>
    </div>
  );
}
