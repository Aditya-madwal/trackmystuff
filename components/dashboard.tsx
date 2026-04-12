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
  Search,
  ListChecks,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/modal";

const DOMAIN_CONFIG: Record<TaskDomain, { label: string; badge: string }> = {
  dsa: { label: "DSA", badge: "badge badge-blue" },
  "system-design": { label: "System Design", badge: "badge badge-purple" },
  frontend: { label: "Frontend", badge: "badge badge-orange" },
  backend: { label: "Backend", badge: "badge badge-green" },
};

const STATUS_CONFIG = {
  todo: {
    label: "Todo",
    icon: Circle,
    color: "text-stone-400 dark:text-stone-500",
    bg: "bg-stone-100 dark:bg-stone-800/40",
    textColor: "text-stone-500 dark:text-stone-400",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
};

export function Dashboard() {
  const { tasks, addTask, updateTaskStatus, deleteTask, isLoaded } = useTasks();
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
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your tasks and manage resources
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Add Task Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Task"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
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
              {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
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
      </Modal>

      {/* Search Bar */}
      {tasks.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10"
          />
        </div>
      )}

      {/* Two-column grid: Tasks + Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task List */}
        <div className="glass-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold">Sprint Backlog</h2>
              <span className="badge badge-gray text-[11px]">
                {filteredTasks.length}
              </span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent/15 transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <ListChecks className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                No tasks yet
              </div>
              <div className="text-xs text-muted-foreground">
                Create your first task to get started
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-sm text-muted-foreground mb-1">
                No tasks match your search
              </div>
              <div className="text-xs text-muted-foreground">
                Try adjusting your search query
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredTasks.map((task) => {
                const StatusIcon = STATUS_CONFIG[task.status].icon;
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <button
                      onClick={() =>
                        updateTaskStatus(task.id, cycleStatus(task.status))
                      }
                      className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                      title="Click to cycle status"
                    >
                      <StatusIcon
                        className={`w-[18px] h-[18px] ${STATUS_CONFIG[task.status].color}`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium mb-1 ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                          {task.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={DOMAIN_CONFIG[task.domain].badge}>
                          {DOMAIN_CONFIG[task.domain].label}
                        </span>
                        <span
                          className={`badge text-[11px] ${STATUS_CONFIG[task.status].bg} ${STATUS_CONFIG[task.status].textColor}`}
                        >
                          {STATUS_CONFIG[task.status].label}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 mt-0.5 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all"
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold">Important Resources</h2>
              <span className="badge badge-gray text-[11px]">
                {resources.length}
              </span>
            </div>
            <button
              onClick={() => setShowResourceForm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent/15 transition-colors font-medium"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Add Resource Modal */}
          <Modal
            open={showResourceForm}
            onClose={() => setShowResourceForm(false)}
            title="Add Resource"
          >
            <form onSubmit={handleAddResource} className="space-y-4">
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
          </Modal>

          {/* Resources List */}
          {resources.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <BookmarkPlus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                No resources yet
              </div>
              <div className="text-xs text-muted-foreground">
                Save important links for quick access
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30 flex-1">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-accent transition-colors truncate block"
                    >
                      {r.title}
                    </a>
                    {r.desc && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.desc}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteResource(r.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all flex-shrink-0"
                    title="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
