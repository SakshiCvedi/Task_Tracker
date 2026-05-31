import { useState, useEffect } from 'react';
import { Plus, X, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import { Task, Project, TaskStatus, Priority } from '../types';
import { tasksApi, projectsApi, usersApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge, PriorityBadge } from '../components/tasks/Badges';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['DONE', 'BLOCKED'],
  DONE: [],
  BLOCKED: ['IN_PROGRESS'],
};

function TaskModal({ task, projects, users, onClose, onSave }: { task?: Task; projects: Project[]; users: any[]; onClose: () => void; onSave: () => void }) {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [form, setForm] = useState({ title: task?.title || '', description: task?.description || '', priority: task?.priority || 'MEDIUM', assigneeId: task?.assignee?.id || '', projectId: task?.project?.id || '', dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { ...form, assigneeId: form.assigneeId || undefined, dueDate: form.dueDate || undefined };
      task ? await tasksApi.update(task.id, payload) : await tasksApi.create(payload as any);
      onSave(); onClose();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit task' : 'New task'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label className="label">Description <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
            <textarea className="input" value={form.description} onChange={set('description')} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Project</label>
              <select className="input" value={form.projectId} onChange={set('projectId')} required disabled={!canManage}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')} disabled={!canManage}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Assignee <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
              <select className="input" value={form.assigneeId} onChange={set('assigneeId')} disabled={!canManage}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Due date <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
              <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} disabled={!canManage} />
            </div>
          </div>
          {error && <p className="error-msg" style={{ marginBottom: '12px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusModal({ task, onClose, onSave }: { task: Task; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const allowed = TRANSITIONS[task.status];

  const handleTransition = async (status: TaskStatus) => {
    setLoading(true);
    try { await tasksApi.updateStatus(task.id, status); onSave(); onClose(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update status</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px' }}>Current: <StatusBadge status={task.status} /></p>
        {allowed.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Task is complete — no further transitions.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allowed.map(s => (
              <button key={s} onClick={() => handleTransition(s)} className="btn btn-ghost" style={{ justifyContent: 'space-between' }} disabled={loading}>
                <StatusBadge status={s} /><ArrowRight size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [statusTask, setStatusTask] = useState<Task | undefined>();
  const [filters, setFilters] = useState({ status: '', priority: '', projectId: '' });
  const [total, setTotal] = useState(0);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const [t, p] = await Promise.all([tasksApi.getAll({ ...params, limit: 50 }), projectsApi.getAll()]);
      setTasks(t.data.data.tasks || []);
      setTotal(t.data.meta?.total || 0);
      setProjects(p.data.data || []);
      if (user?.role === 'ADMIN') {
        const u = await usersApi.getAll({ limit: 100 });
        setUsers(u.data.data.users || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await tasksApi.delete(id); load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{total} task{total !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <button className="btn btn-primary" onClick={() => { setEditTask(undefined); setShowModal(true); }}><Plus size={15} />New task</button>}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select className="input" style={{ width: 'auto' }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filters.projectId} onChange={e => setFilters(f => ({ ...f, projectId: e.target.value }))}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(filters.status || filters.priority || filters.projectId) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', projectId: '' })}>
            <X size={13} />Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><span className="spinner" style={{ width: '24px', height: '24px' }} /></div>
      ) : tasks.length === 0 ? (
        <div className="card empty-state" style={{ padding: '80px 20px' }}><h3>No tasks found</h3><p>Try adjusting your filters or create a new task</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map(task => (
            <div key={task.id} className="card fade-in" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{task.project.name}</span>
                    {task.assignee && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>· {task.assignee.firstName} {task.assignee.lastName}</span>}
                    {task.dueDate && <span style={{ fontSize: '12px', color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'var(--text3)' }}>· Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  <PriorityBadge priority={task.priority} />
                  <button onClick={() => setStatusTask(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <StatusBadge status={task.status} />
                  </button>
                  {canManage && <>
                    <button onClick={() => { setEditTask(task); setShowModal(true); }} className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: '4px' }}><ChevronDown size={13} /></button>
                    <button onClick={() => handleDelete(task.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </>}
                </div>
              </div>
              {task.description && <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>{task.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && <TaskModal task={editTask} projects={projects} users={users} onClose={() => setShowModal(false)} onSave={load} />}
      {statusTask && <StatusModal task={statusTask} onClose={() => setStatusTask(undefined)} onSave={load} />}
    </div>
  );
}