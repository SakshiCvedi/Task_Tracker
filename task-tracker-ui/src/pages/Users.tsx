import { useState, useEffect } from 'react';
import { Shield, UserX, X } from 'lucide-react';
import { User } from '../types';
import { usersApi } from '../services/api';
import { RoleBadge } from '../components/tasks/Badges';

function RoleModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: () => void }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await usersApi.updateRole(user.id, role); onSave(); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change role</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>{user.firstName} {user.lastName}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <span className="spinner" /> : 'Update role'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleUser, setRoleUser] = useState<User | undefined>();

  const load = () => usersApi.getAll({ limit: 100 }).then(r => setUsers(r.data.data.users || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    await usersApi.deactivate(id); load();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><span className="spinner" style={{ width: '28px', height: '28px' }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Member', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: 'var(--text2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--accent2)', flexShrink: 0 }}>
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text2)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge" style={{ color: u.isActive ? 'var(--success)' : 'var(--text3)', background: u.isActive ? 'var(--success-bg)' : 'var(--bg4)' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setRoleUser(u)} className="btn btn-ghost btn-sm"><Shield size={12} />Role</button>
                    {u.isActive && <button onClick={() => handleDeactivate(u.id)} className="btn btn-danger btn-sm"><UserX size={12} />Deactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {roleUser && <RoleModal user={roleUser} onClose={() => setRoleUser(undefined)} onSave={load} />}
    </div>
  );
}