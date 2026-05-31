import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', orgName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      const res = await authApi.login(form.email, form.password);
      const { accessToken, refreshToken, user } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--accent-bg)', borderRadius: '12px', marginBottom: '16px' }}>
            <Zap size={24} color="var(--accent2)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Set up your team workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '28px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">First name</label>
              <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="John" required />
            </div>
            <div className="form-group">
              <label className="label">Last name</label>
              <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Doe" required />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 number" required />
          </div>
          <div className="form-group">
            <label className="label">Organization name</label>
            <input className="input" value={form.orgName} onChange={set('orgName')} placeholder="Acme Inc." required />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: '12px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : <><UserPlus size={15} />Create account</>}
          </button>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text2)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent2)' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}