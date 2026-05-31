import { useState, useEffect } from 'react';
import { Plus, FolderKanban, Trash2, Edit2, X } from 'lucide-react';
import { Project } from '../types';
import { projectsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function ProjectModal({ project, onClose, onSave }: { project?: Project; onClose: () => void; onSave: () => void }) {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      project ? await projectsApi.update(project.id, { name, description }) : await projectsApi.create({ name, description });
      onSave(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Edit project' : 'New project'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Project name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Project" required />
          </div>
          <div className="form-group">
            <label className="label">Description <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
            <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>
          {error && <p className="error-msg" style={{ marginBottom: '12px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const load = () => projectsApi.getAll().then(r => setProjects(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await projectsApi.delete(id); load();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><span className="spinner" style={{ width: '28px', height: '28px' }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <button className="btn btn-primary" onClick={() => { setEditProject(undefined); setShowModal(true); }}><Plus size={15} />New project</button>}
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state" style={{ padding: '80px 20px' }}>
          <FolderKanban size={40} color="var(--text3)" style={{ margin: '0 auto 12px' }} />
          <h3>No projects yet</h3><p>Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FolderKanban size={16} color="var(--accent2)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>by {p.createdBy.firstName} {p.createdBy.lastName}</p>
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { setEditProject(p); setShowModal(true); }} className="btn btn-ghost btn-icon btn-sm"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
              {p.description && <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.5 }}>{p.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{p._count?.tasks ?? 0} tasks</span>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <ProjectModal project={editProject} onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}