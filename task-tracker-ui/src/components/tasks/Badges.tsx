import { TaskStatus, Priority } from '../../types';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'Todo',        color: 'var(--text2)',   bg: 'var(--bg4)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--info)',    bg: 'var(--info-bg)' },
  IN_REVIEW:   { label: 'In Review',   color: 'var(--purple)',  bg: 'var(--purple-bg)' },
  DONE:        { label: 'Done',        color: 'var(--success)', bg: 'var(--success-bg)' },
  BLOCKED:     { label: 'Blocked',     color: 'var(--danger)',  bg: 'var(--danger-bg)' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW:    { label: 'Low',    color: 'var(--text2)',   bg: 'var(--bg4)' },
  MEDIUM: { label: 'Medium', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  HIGH:   { label: 'High',   color: 'var(--danger)',  bg: 'var(--danger-bg)' },
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const cfg = statusConfig[status];
  return (
    <span className="badge" style={{ color: cfg.color, background: cfg.bg }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const cfg = priorityConfig[priority];
  return <span className="badge" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>;
};

export const RoleBadge = ({ role }: { role: string }) => {
  const configs: Record<string, { color: string; bg: string }> = {
    ADMIN:   { color: 'var(--purple)', bg: 'var(--purple-bg)' },
    MANAGER: { color: 'var(--info)',   bg: 'var(--info-bg)' },
    MEMBER:  { color: 'var(--text2)',  bg: 'var(--bg4)' },
  };
  const cfg = configs[role] || configs.MEMBER;
  return <span className="badge" style={{ color: cfg.color, background: cfg.bg }}>{role}</span>;
};