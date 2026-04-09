"use client";

import { useSystemDesignNotes } from "@/lib/hooks";
import { Plus, Trash2, ChevronDown, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

// Markdown renderer function
const renderMarkdown = (text: string): React.ReactNode => {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let codeBlock = false;
  let codeContent = "";
  let listItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (codeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-primary/8 border border-border/30 rounded-md p-3 overflow-x-auto text-xs font-mono text-foreground/80 leading-relaxed mb-2.5"
          >
            {codeContent.trim()}
          </pre>,
        );
        codeContent = "";
        codeBlock = false;
      } else {
        codeBlock = true;
      }
      continue;
    }

    if (codeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // Headers
    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-semibold mt-3 mb-1.5 text-foreground"
        >
          {line.slice(3)}
        </h3>,
      );
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base font-bold mt-3 mb-2 text-foreground"
        >
          {line.slice(2)}
        </h2>,
      );
      continue;
    }

    // Bold and italic
    let processedLine = line
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

    // Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
      continue;
    } else if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${i}`}
          className="list-disc list-inside text-sm text-foreground mb-2.5 space-y-0.5"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }

    // Empty lines and regular text
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="text-sm text-foreground mb-2">
          {processedLine}
        </p>,
      );
    } else if (elements.length > 0) {
      elements.push(<div key={`space-${i}`} className="h-1" />);
    }
  }

  // Handle remaining list items
  if (listItems.length > 0) {
    elements.push(
      <ul
        key="final-list"
        className="list-disc list-inside text-sm text-foreground mb-2.5 space-y-0.5"
      >
        {listItems.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>,
    );
  }

  return elements.length > 0 ? (
    elements
  ) : (
    <p className="text-sm text-foreground">{text}</p>
  );
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
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-base font-semibold">Architecture Notes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Patterns, designs, and knowledge base
          </p>
        </div>
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

      {/* Search Bar */}
      {notes.length > 0 && (
        <div className="glass-card p-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
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

      {/* Add Note Form */}
      {showForm && (
        <div className="glass-card p-4">
          <form onSubmit={handleAddNote} className="space-y-3.5">
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
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-sm text-muted-foreground mb-1">No notes yet</div>
          <div className="text-xs text-muted-foreground">
            Create your first note to get started
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="text-sm text-muted-foreground mb-1">
            No notes match your search
          </div>
          <div className="text-xs text-muted-foreground">
            Try adjusting your search query
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/40 glass-card overflow-hidden">
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
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                    expandedId === note.id ? "rotate-180" : ""
                  }`}
                />

                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{note.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>

              {expandedId === note.id && (
                <div className="border-t border-border/40 px-4 py-3.5 space-y-4 bg-muted/20">
                  <div className="prose prose-sm max-w-none">
                    {renderMarkdown(note.content)}
                  </div>

                  {note.references && note.references.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-tight">
                        References
                      </h3>
                      <div className="space-y-1.5">
                        {note.references.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
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
