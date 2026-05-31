import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, FolderKanban, AlertCircle, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { tasksApi, projectsApi } from '../services/api';
import { Task, Project } from '../types';
import { StatusBadge, PriorityBadge } from '../components/tasks/Badges';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tasksApi.getAll({ limit: 50 }), projectsApi.getAll()])
      .then(([t, p]) => {
        setTasks(t.data.data.tasks || []);
        setProjects(p.data.data || []);
      }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span className="spinner" style={{ width: '28px', height: '28px' }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600' }}>{greeting}, {user?.firstName} 👋</h1>
        <p style={{ color: 'var(--text2)', marginTop: '4px', fontSize: '14px' }}>Here's what's happening with your team today.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total tasks',  value: stats.total,      icon: CheckSquare, color: 'var(--accent2)', bg: 'var(--accent-bg)' },
          { label: 'In progress',  value: stats.inProgress, icon: TrendingUp,  color: 'var(--info)',    bg: 'var(--info-bg)' },
          { label: 'Blocked',      value: stats.blocked,    icon: AlertCircle, color: 'var(--danger)',  bg: 'var(--danger-bg)' },
          { label: 'Completed',    value: stats.done,       icon: Clock,       color: 'var(--success)', bg: 'var(--success-bg)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: '600', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '3px' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Recent tasks</h2>
            <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent2)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.slice(0, 6).length === 0 ? (
              <div className="card empty-state"><p>No tasks yet</p></div>
            ) : tasks.slice(0, 6).map(task => (
              <div key={task.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '500', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{task.project.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Projects</h2>
            <Link to="/projects" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent2)' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projects.slice(0, 5).map(p => (
              <Link to="/projects" key={p.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderKanban size={14} color="var(--accent2)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '500', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text3)' }}>{p._count?.tasks ?? 0} tasks</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}