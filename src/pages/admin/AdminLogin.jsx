import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Lock size={22} color="#fff" />
          </div>
          <h2 style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Admin Login</h2>
          <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>Access the management dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="username"
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={{ paddingLeft: '2.2rem' }}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: '2.2rem' }}
                required
              />
            </div>
          </div>

          {error && (
            <div style={{ background: '#7f1d1d33', border: '1px solid #991b1b', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#fca5a5', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            style={{ justifyContent: 'center' }}
          >
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          Need access?{' '}
          <Link
            to="/contact#admin-request"
            style={{ color: 'var(--accent)' }}
          >
            Request here →
          </Link>
        </p>
      </div>
    </div>
  );
}
