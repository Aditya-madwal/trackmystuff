"use client";

import { useSystemDesignNotes } from "@/lib/hooks";
import { Plus, Trash2, ChevronDown, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/modal";
import Markdown from "markdown-to-jsx";

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
        "bg-background border border-border rounded-md p-4 overflow-x-auto text-xs font-mono text-foreground/80 leading-relaxed mb-2.5",
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

export function SystemDesign() {
  const { notes, addNote, updateNote, deleteNote, isLoaded } =
    useSystemDesignNotes();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    references: "" as string,
  });

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [notes, searchQuery]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const referencesArray = formData.references
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [title, url] = line.split("|").map((s) => s.trim());
        return { title, url };
      });

    addNote({
      title: formData.title,
      content: formData.content,
      references: referencesArray.length > 0 ? referencesArray : undefined,
    });

    setFormData({
      title: "",
      content: "",
      references: "",
    });
    setShowForm(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Architecture Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Patterns, designs, and knowledge base
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-1.5 text-[13px]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Note
        </button>
      </div>

      {/* Search Bar */}
      {notes.length > 0 && (
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
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
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-10"
          />
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Note"
        wide
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g., Database Sharding Strategy"
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
              Content
            </label>
            <textarea
              placeholder={`Your architectural notes...

Key Points:
- Point 1
- Point 2`}
              className="glass-input w-full resize-none font-mono text-sm"
              rows={7}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
              References (optional)
            </label>
            <textarea
              placeholder={`Title | URL
Example: CAP Theorem | https://example.com`}
              className="glass-input w-full resize-none font-mono text-sm"
              rows={2}
              value={formData.references}
              onChange={(e) =>
                setFormData({ ...formData, references: e.target.value })
              }
            />
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
              Add Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Plus className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">No notes yet</div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-sm text-muted-foreground">
            No notes match your search
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border glass-card overflow-hidden">
          {filteredNotes.map((note) => (
            <div key={note.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedId(expandedId === note.id ? null : note.id)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(expandedId === note.id ? null : note.id);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                    expandedId === note.id ? "rotate-180" : ""
                  }`}
                />

                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-sm">{note.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="badge badge-gray text-[11px]">
                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md transition-all"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                </button>
              </div>

              {expandedId === note.id && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/30">
                  <div className="max-w-none">
                    <Markdown options={{ overrides: markdownOverrides }}>
                      {note.content}
                    </Markdown>
                  </div>

                  {note.references && note.references.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        References
                      </h3>
                      <div className="space-y-2">
                        {note.references.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{ref.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
