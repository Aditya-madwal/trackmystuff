"use client";

import { useNotes } from "@/lib/hooks";
import { NoteCategory, NOTE_CATEGORIES } from "@/lib/types";
import { Plus, Trash2, Pencil, Search, StickyNote } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/modal";
import { RichTextEditor } from "@/components/rich-text-editor";
import Markdown from "markdown-to-jsx";

const CATEGORY_COLORS: Record<NoteCategory, { badge: string; border: string }> =
  {
    dsa: {
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      border: "border-l-blue-400 dark:border-l-blue-500",
    },
    tips: {
      badge:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      border: "border-l-amber-400 dark:border-l-amber-500",
    },
    "system design": {
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      border: "border-l-purple-400 dark:border-l-purple-500",
    },
    interview: {
      badge:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      border: "border-l-emerald-400 dark:border-l-emerald-500",
    },
    job: {
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
      border: "border-l-rose-400 dark:border-l-rose-500",
    },
    general: {
      badge:
        "bg-stone-100 text-stone-700 dark:bg-stone-500/20 dark:text-stone-400",
      border: "border-l-stone-400 dark:border-l-stone-500",
    },
    other: {
      badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
      border: "border-l-sky-400 dark:border-l-sky-500",
    },
  };

const markdownOverrides = {
  h1: { props: { className: "text-base font-bold mt-3 mb-2 text-foreground" } },
  h2: {
    props: { className: "text-sm font-semibold mt-3 mb-1.5 text-foreground" },
  },
  h3: { props: { className: "text-sm font-medium mt-2 mb-1 text-foreground" } },
  p: { props: { className: "text-sm text-foreground mb-2 leading-relaxed" } },
  ul: {
    props: {
      className:
        "list-disc list-inside text-sm text-foreground mb-2.5 space-y-0.5",
    },
  },
  ol: {
    props: {
      className:
        "list-decimal list-inside text-sm text-foreground mb-2.5 space-y-0.5",
    },
  },
  li: { props: { className: "text-sm text-foreground" } },
  strong: { props: { className: "font-semibold text-foreground" } },
  em: { props: { className: "italic" } },
  code: {
    props: {
      className:
        "bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground/80",
    },
  },
  pre: {
    props: {
      className:
        "bg-card border border-border/40 rounded-xl p-4 overflow-x-auto text-xs font-mono text-foreground/80 leading-relaxed mb-2.5",
    },
  },
  a: {
    props: {
      className: "text-accent hover:text-accent/80 underline transition-colors",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  },
  blockquote: {
    props: {
      className:
        "border-l-2 border-accent/40 pl-3 my-2 text-sm text-muted-foreground italic",
    },
  },
  hr: { props: { className: "border-border/40 my-3" } },
};

export function Notes() {
  const { notes, addNote, updateNote, deleteNote, isLoaded } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    NoteCategory | "all"
  >("all");
  const [viewingNote, setViewingNote] = useState<(typeof notes)[number] | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general" as NoteCategory,
  });

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const categoryMatch =
        selectedCategory === "all" || note.category === selectedCategory;
      const searchMatch =
        searchQuery.length === 0 ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addNote({
      title: formData.title,
      description: formData.description,
      category: formData.category,
    });

    setFormData({ title: "", description: "", category: "general" });
    setShowForm(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.title.trim()) return;

    updateNote(editingId, {
      title: formData.title,
      description: formData.description,
      category: formData.category,
    });

    setEditingId(null);
    setFormData({ title: "", description: "", category: "general" });
  };

  const openEdit = (note: {
    id: string;
    title: string;
    description: string;
    category: NoteCategory;
  }) => {
    setFormData({
      title: note.title,
      description: note.description,
      category: note.category,
    });
    setEditingId(note.id);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", category: "general" });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tips, strategies &amp; preparation notes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-9 w-full"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                selectedCategory === cat
                  ? CATEGORY_COLORS[cat].badge + " ring-1 ring-current/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Note Modal */}
      <Modal open={showForm} onClose={closeForm} title="New Note" wide>
        <form onSubmit={handleAdd} className="space-y-4">
          <input
            type="text"
            placeholder="Note title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="glass-input w-full"
            autoFocus
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as NoteCategory,
                })
              }
              className="glass-input w-full capitalize"
            >
              {NOTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <RichTextEditor
              content={formData.description}
              onChange={(md) => setFormData({ ...formData, description: md })}
              placeholder="Write your note..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="glass-button">
              Add Note
            </button>
          </div>
        </form>
      </Modal>

      {/* View Note Modal */}
      <Modal
        open={!!viewingNote}
        onClose={() => setViewingNote(null)}
        title={viewingNote?.title ?? ""}
        wide
      >
        {viewingNote && (
          <div className="space-y-3">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                (
                  CATEGORY_COLORS[viewingNote.category] ||
                  CATEGORY_COLORS.general
                ).badge
              }`}
            >
              {viewingNote.category}
            </span>
            <div className="prose-compact">
              {viewingNote.description ? (
                <Markdown options={{ overrides: markdownOverrides }}>
                  {viewingNote.description}
                </Markdown>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No content
                </p>
              )}
            </div>
            <div className="pt-3 border-t border-border/30 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {new Date(viewingNote.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openEdit(viewingNote);
                    setViewingNote(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    deleteNote(viewingNote.id);
                    setViewingNote(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Note Modal */}
      <Modal open={!!editingId} onClose={closeForm} title="Edit Note" wide>
        <form onSubmit={handleEdit} className="space-y-4">
          <input
            type="text"
            placeholder="Note title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="glass-input w-full"
            autoFocus
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as NoteCategory,
                })
              }
              className="glass-input w-full capitalize"
            >
              {NOTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <RichTextEditor
              content={formData.description}
              onChange={(md) => setFormData({ ...formData, description: md })}
              placeholder="Write your note..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="glass-button">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes Grid — Google Keep style */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <StickyNote className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">No notes yet</p>
          <p className="text-xs mt-1">
            Click &quot;New Note&quot; to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const colors =
              CATEGORY_COLORS[note.category] || CATEGORY_COLORS.general;
            return (
              <div
                key={note.id}
                onClick={() => setViewingNote(note)}
                className={`group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 border-l-[3px] cursor-pointer ${colors.border}`}
              >
                {/* Card Header */}
                <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {note.title}
                    </h3>
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${colors.badge}`}
                    >
                      {note.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(note);
                      }}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body — Markdown rendered */}
                <div className="px-4 pb-4 max-h-[200px] overflow-hidden relative">
                  {note.description ? (
                    <div className="prose-compact">
                      <Markdown options={{ overrides: markdownOverrides }}>
                        {note.description}
                      </Markdown>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No content
                    </p>
                  )}
                  {/* Fade overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
