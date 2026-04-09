'use client';

import { useTasks } from '@/lib/hooks';
import { Task, TaskDomain, TaskStatus } from '@/lib/types';
import { Plus, Trash2, Circle, CheckCircle2, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

const DOMAIN_LABELS: Record<TaskDomain, string> = {
  dsa: 'DSA',
  'system-design': 'System Design',
  frontend: 'Frontend',
  backend: 'Backend',
};

const STATUS_CONFIG = {
  todo: { label: 'Todo', icon: Circle, color: 'text-slate-400' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
};

export function Dashboard() {
  const { tasks, addTask, updateTaskStatus, deleteTask, getStats, isLoaded } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'dsa' as TaskDomain,
  });

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const stats = getStats();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask({
      title: formData.title,
      description: formData.description,
      domain: formData.domain,
      status: 'todo',
    });

    setFormData({ title: '', description: '', domain: 'dsa' });
    setShowForm(false);
  };

  const cycleStatus = (status: TaskStatus): TaskStatus => {
    const cycle: Record<TaskStatus, TaskStatus> = {
      todo: 'in-progress',
      'in-progress': 'completed',
      completed: 'todo',
    };
    return cycle[status];
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-label">Active Sprints</div>
          <div className="stat-value">{stats.activeSprints}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Verified Tasks</div>
          <div className="stat-value text-success">{stats.verifiedTasks}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{tasks.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Completion</div>
          <div className="stat-value">
            {tasks.length > 0 ? Math.round((stats.verifiedTasks / tasks.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="glass-card p-4">
          <form onSubmit={handleAddTask} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Task Title</label>
              <input
                type="text"
                placeholder="Enter task title..."
                className="glass-input w-full"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Description</label>
              <textarea
                placeholder="Enter task description (optional)..."
                className="glass-input w-full resize-none"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Domain</label>
              <select
                className="glass-input w-full"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value as TaskDomain })}
              >
                {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="glass-button-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="glass-button">
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      {tasks.length > 0 && (
        <div className="glass-card p-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-8"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="glass-card">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
          <h2 className="text-sm font-semibold">Sprint Backlog</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-accent/10 text-accent hover:bg-accent/15 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 px-4">
            <div className="text-sm text-muted-foreground mb-1">No tasks yet</div>
            <div className="text-xs text-muted-foreground">Create your first task to get started</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-6 px-4">
            <div className="text-sm text-muted-foreground mb-1">No tasks match your search</div>
            <div className="text-xs text-muted-foreground">Try adjusting your search query</div>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredTasks.map((task) => {
              const StatusIcon = STATUS_CONFIG[task.status].icon;
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors group"
                >
                  <button
                    onClick={() => updateTaskStatus(task.id, cycleStatus(task.status))}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                    title="Click to cycle status"
                  >
                    <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[task.status].color}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-0.5">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mb-1.5">{task.description}</div>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                        {DOMAIN_LABELS[task.domain]}
                      </span>
                      <span className="text-xs text-muted-foreground">{STATUS_CONFIG[task.status].label}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 mt-0.5 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
