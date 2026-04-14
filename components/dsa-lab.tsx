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
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    inactive:
      "bg-transparent text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground",
  },
  Medium: {
    active:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    inactive:
      "bg-transparent text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground",
  },
  Hard: {
    active:
      "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    inactive:
      "bg-transparent text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground",
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
            Problem Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track problems, strategies, and implementations
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glass-button flex items-center gap-1.5 text-[13px]"
        >
          <Plus className="w-3.5 h-3.5" />
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
                className={`text-xs px-2.5 py-1 rounded-full transition-all font-medium ${
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
                      className={`text-xs px-2 py-1 rounded-full transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-foreground/10 text-foreground border border-foreground/20 font-medium"
                          : "bg-transparent text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground"
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
                className="text-xs text-muted-foreground hover:text-foreground ml-auto font-medium flex items-center gap-1"
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
        <div className="glass-card p-12 text-center">
          <Code2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <div className="text-sm text-muted-foreground">
            No problems tracked yet
          </div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-sm text-muted-foreground">
            No problems match your filters
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border glass-card overflow-hidden">
          {filteredQuestions.map((question) => (
            <div key={question.id}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group">
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
                  className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md transition-all"
                  title="Delete problem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                </button>
              </div>

              {expandedId === question.id && (
                <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/30">
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
                      <pre className="bg-background border border-border rounded-md p-4 overflow-x-auto text-xs font-mono text-foreground/80 leading-relaxed">
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
