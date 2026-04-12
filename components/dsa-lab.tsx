"use client";

import { useDSAQuestions } from "@/lib/hooks";
import { Difficulty } from "@/lib/types";
import { Plus, Trash2, ChevronDown, X, Search, Code2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/modal";

const DIFFICULTY_CONFIG = {
  Easy: { badge: "badge badge-green", label: "Easy" },
  Medium: { badge: "badge badge-orange", label: "Medium" },
  Hard: { badge: "badge badge-red", label: "Hard" },
};

const DIFFICULTY_FILTER_COLORS = {
  Easy: {
    active:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30",
    inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  Medium: {
    active:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30",
    inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
  Hard: {
    active:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-500/30",
    inactive: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
};

export function DSALab() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, isLoaded } =
    useDSAQuestions();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Difficulty[]
  >([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    difficulty: "Medium" as Difficulty,
    strategy: "",
    codeImplementation: "",
    language: "python",
    tags: "",
  });

  // Extract all unique tags from questions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach((q) => {
      q.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [questions]);

  // Filter questions based on search, difficulty and tags
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const difficultyMatch =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(question.difficulty);
      const tagMatch =
        selectedTags.length === 0 ||
        question.tags.some((tag) => selectedTags.includes(tag));
      const searchMatch =
        searchQuery.length === 0 ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.problemStatement
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      return difficultyMatch && tagMatch && searchMatch;
    });
  }, [questions, selectedDifficulties, selectedTags, searchQuery]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addQuestion({
      title: formData.title,
      problemStatement: formData.problemStatement,
      difficulty: formData.difficulty,
      strategy: formData.strategy,
      codeImplementation: formData.codeImplementation,
      language: formData.language,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setFormData({
      title: "",
      problemStatement: "",
      difficulty: "Medium",
      strategy: "",
      codeImplementation: "",
      language: "python",
      tags: "",
    });
    setShowForm(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading problems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Problem Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track problems, strategies, and implementations
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Problem
        </button>
      </div>

      {/* Search and Filters */}
      {questions.length > 0 && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search problems by title or statement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>

          {/* Difficulty & Tags Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            {Object.keys(DIFFICULTY_CONFIG).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => {
                  setSelectedDifficulties((prev) =>
                    prev.includes(difficulty as Difficulty)
                      ? prev.filter((d) => d !== difficulty)
                      : [...prev, difficulty as Difficulty],
                  );
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                  selectedDifficulties.includes(difficulty as Difficulty)
                    ? DIFFICULTY_FILTER_COLORS[difficulty as Difficulty].active
                    : DIFFICULTY_FILTER_COLORS[difficulty as Difficulty]
                        .inactive
                }`}
              >
                {DIFFICULTY_CONFIG[difficulty as Difficulty].label}
              </button>
            ))}

            {allTags.length > 0 && (
              <>
                <div className="w-px h-5 bg-border/60" />
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag],
                        );
                      }}
                      className={`text-xs px-2 py-1 rounded-lg transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-accent/15 text-accent ring-1 ring-accent/20 font-medium"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}

            {(selectedDifficulties.length > 0 || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSelectedDifficulties([]);
                  setSelectedTags([]);
                }}
                className="text-xs text-accent hover:text-accent/80 ml-auto font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs text-muted-foreground">
            {filteredQuestions.length} of {questions.length} problems
          </div>
        </div>
      )}

      {/* Add Problem Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Problem"
        wide
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Problem Title
              </label>
              <input
                type="text"
                placeholder="e.g., Two Sum"
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
                Difficulty
              </label>
              <select
                className="glass-input w-full"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as Difficulty,
                  })
                }
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
              Problem Statement
            </label>
            <textarea
              placeholder="Describe the problem..."
              className="glass-input w-full resize-none font-mono text-sm"
              rows={2}
              value={formData.problemStatement}
              onChange={(e) =>
                setFormData({ ...formData, problemStatement: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
              Strategy / Approach
            </label>
            <textarea
              placeholder="Step-by-step algorithmic approach..."
              className="glass-input w-full resize-none"
              rows={3}
              value={formData.strategy}
              onChange={(e) =>
                setFormData({ ...formData, strategy: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Language
              </label>
              <select
                className="glass-input w-full"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
                Tags
              </label>
              <input
                type="text"
                placeholder="e.g., array, hash-map"
                className="glass-input w-full"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
              Code Implementation
            </label>
            <textarea
              placeholder="Paste your code solution here..."
              className="glass-input w-full resize-none font-mono text-sm"
              rows={6}
              value={formData.codeImplementation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  codeImplementation: e.target.value,
                })
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
              Add Problem
            </button>
          </div>
        </form>
      </Modal>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Code2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground mb-1">
            No problems tracked yet
          </div>
          <div className="text-xs text-muted-foreground">
            Add your first problem to get started
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="text-sm text-muted-foreground mb-1">
            No problems match your filters
          </div>
          <div className="text-xs text-muted-foreground">
            Try adjusting your difficulty or tag selection
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/30 glass-card overflow-hidden">
          {filteredQuestions.map((question) => (
            <div key={question.id}>
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === question.id ? null : question.id,
                    )
                  }
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                      expandedId === question.id ? "rotate-180" : ""
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1.5">
                      {question.title}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={DIFFICULTY_CONFIG[question.difficulty].badge}
                      >
                        {DIFFICULTY_CONFIG[question.difficulty].label}
                      </span>
                      {question.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              className="badge badge-gray text-[11px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all"
                  title="Delete problem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>

              {expandedId === question.id && (
                <div className="border-t border-border/30 px-5 py-4 space-y-4 bg-muted/15">
                  {question.problemStatement && (
                    <div>
                      <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        Problem
                      </h3>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {question.problemStatement}
                      </p>
                    </div>
                  )}

                  {question.strategy && (
                    <div>
                      <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                        Approach
                      </h3>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {question.strategy}
                      </p>
                    </div>
                  )}

                  {question.codeImplementation && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Code
                        </h3>
                        <span className="badge badge-blue text-[11px]">
                          {question.language}
                        </span>
                      </div>
                      <pre className="bg-card border border-border/40 rounded-xl p-4 overflow-x-auto text-xs font-mono text-foreground/80 leading-relaxed">
                        {question.codeImplementation}
                      </pre>
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
