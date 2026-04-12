"use client";

import { useTasks, useResources } from "@/lib/hooks";
import { Task, TaskDomain, TaskStatus } from "@/lib/types";
import {
  Plus,
  Trash2,
  Circle,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookmarkPlus,
} from "lucide-react";
import { useState, useMemo } from "react";

const DOMAIN_LABELS: Record<TaskDomain, string> = {
  dsa: "DSA",
  "system-design": "System Design",
  frontend: "Frontend",
  backend: "Backend",
};

const STATUS_CONFIG = {
  todo: { label: "Todo", icon: Circle, color: "text-slate-400" },
  "in-progress": { label: "In Progress", icon: Clock, color: "text-blue-500" },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-500",
  },
};

export function Dashboard() {
  const { tasks, addTask, updateTaskStatus, deleteTask, getStats, isLoaded } =
    useTasks();
  const {
    resources,
    addResource,
    deleteResource,
    isLoaded: resourcesLoaded,
  } = useResources();
  const [showForm, setShowForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "dsa" as TaskDomain,
  });
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    desc: "",
    url: "",
  });

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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
      status: "todo",
    });

    setFormData({ title: "", description: "", domain: "dsa" });
    setShowForm(false);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFormData.title.trim() || !resourceFormData.url.trim()) return;

    addResource({
      title: resourceFormData.title,
      desc: resourceFormData.desc,
      url: resourceFormData.url,
    });

    setResourceFormData({ title: "", desc: "", url: "" });
    setShowResourceForm(false);
  };

  const cycleStatus = (status: TaskStatus): TaskStatus => {
    const cycle: Record<TaskStatus, TaskStatus> = {
      todo: "in-progress",
      "in-progress": "completed",
      completed: "todo",
    };
    return cycle[status];
  };

  if (!isLoaded || !resourcesLoaded) {
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
            {tasks.length > 0
              ? Math.round((stats.verifiedTasks / tasks.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="glass-card p-4">
          <form onSubmit={handleAddTask} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Task Title
              </label>
              <input
                type="text"
                placeholder="Enter task title..."
                className="glass-input w-full"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Description
              </label>
              <textarea
                placeholder="Enter task description (optional)..."
                className="glass-input w-full resize-none"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Domain
              </label>
              <select
                className="glass-input w-full"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    domain: e.target.value as TaskDomain,
                  })
                }
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

      {/* Two-column grid: Tasks + Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              <div className="text-sm text-muted-foreground mb-1">
                No tasks yet
              </div>
              <div className="text-xs text-muted-foreground">
                Create your first task to get started
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-6 px-4">
              <div className="text-sm text-muted-foreground mb-1">
                No tasks match your search
              </div>
              <div className="text-xs text-muted-foreground">
                Try adjusting your search query
              </div>
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
                      onClick={() =>
                        updateTaskStatus(task.id, cycleStatus(task.status))
                      }
                      className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                      title="Click to cycle status"
                    >
                      <StatusIcon
                        className={`w-4 h-4 ${STATUS_CONFIG[task.status].color}`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium mb-0.5">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground mb-1.5">
                          {task.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                          {DOMAIN_LABELS[task.domain]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {STATUS_CONFIG[task.status].label}
                        </span>
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

        {/* Important Resources */}
        <div className="glass-card flex flex-col">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
            <h2 className="text-sm font-semibold">Important Resources</h2>
            {!showResourceForm && (
              <button
                onClick={() => setShowResourceForm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-accent/10 text-accent hover:bg-accent/15 transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>

          {/* Add Resource Form */}
          {showResourceForm && (
            <div className="p-4 border-b border-border/40">
              <form onSubmit={handleAddResource} className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Resource name..."
                    className="glass-input w-full"
                    value={resourceFormData.title}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        title: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description (optional)..."
                    className="glass-input w-full"
                    value={resourceFormData.desc}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        desc: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                    URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="glass-input w-full"
                    value={resourceFormData.url}
                    onChange={(e) =>
                      setResourceFormData({
                        ...resourceFormData,
                        url: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResourceForm(false)}
                    className="glass-button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="glass-button">
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resources Table */}
          {resources.length === 0 ? (
            <div className="text-center py-6 px-4">
              <div className="text-sm text-muted-foreground mb-1">
                No resources yet
              </div>
              <div className="text-xs text-muted-foreground">
                Save important links for quick access
              </div>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left">
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-tight">
                      Title
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-tight hidden sm:table-cell">
                      Description
                    </th>
                    <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-tight w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {resources.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-4 py-2.5">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-accent hover:text-accent/80 font-medium transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{r.title}</span>
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[200px] hidden sm:table-cell">
                        {r.desc || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => deleteResource(r.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                          title="Delete resource"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
