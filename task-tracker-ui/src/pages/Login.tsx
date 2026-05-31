import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { accessToken, refreshToken, user } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--accent-bg)', borderRadius: '12px', marginBottom: '16px' }}>
            <Zap size={24} color="var(--accent2)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Sign in to your TaskFlow account</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
          <div className="form-group">
            <label className="label">Email address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: '12px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : <><LogIn size={15} />Sign in</>}
          </button>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
            No account? <Link to="/register" style={{ color: 'var(--accent2)' }}>Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}