"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Task,
  DSAQuestion,
  SystemDesignNote,
  TaskStatus,
  Resource,
} from "./types";

// Helper: map MongoDB _id → id for frontend compatibility
function mapId<T extends Record<string, unknown>>(doc: T): T & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id) } as T & { id: string };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.map(mapId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const created = await res.json();
    const mapped = mapId(created);
    setTasks((prev) => [mapped, ...prev]);
    return mapped;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const updated = mapId(await res.json());
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const getStats = () => ({
    activeSprints: tasks.filter((t) => t.status !== "completed").length,
    verifiedTasks: tasks.filter((t) => t.status === "completed").length,
  });

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getStats,
    isLoaded,
  };
}

// ---------------------------------------------------------------------------
// DSA Questions
// ---------------------------------------------------------------------------
export function useDSAQuestions() {
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/dsa-questions");
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.map(mapId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const addQuestion = async (
    question: Omit<DSAQuestion, "id" | "createdAt">,
  ) => {
    const res = await fetch("/api/dsa-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    });
    if (!res.ok) throw new Error("Failed to create question");
    const created = mapId(await res.json());
    setQuestions((prev) => [created, ...prev]);
    return created;
  };

  const updateQuestion = async (id: string, updates: Partial<DSAQuestion>) => {
    const res = await fetch(`/api/dsa-questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update question");
    const updated = mapId(await res.json());
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const deleteQuestion = async (id: string) => {
    const res = await fetch(`/api/dsa-questions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete question");
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return { questions, addQuestion, updateQuestion, deleteQuestion, isLoaded };
}

// ---------------------------------------------------------------------------
// System Design Notes
// ---------------------------------------------------------------------------
export function useSystemDesignNotes() {
  const [notes, setNotes] = useState<SystemDesignNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/system-design");
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data.map(mapId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (note: Omit<SystemDesignNote, "id" | "createdAt">) => {
    const res = await fetch("/api/system-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error("Failed to create note");
    const created = mapId(await res.json());
    setNotes((prev) => [created, ...prev]);
    return created;
  };

  const updateNote = async (id: string, updates: Partial<SystemDesignNote>) => {
    const res = await fetch(`/api/system-design/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update note");
    const updated = mapId(await res.json());
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`/api/system-design/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete note");
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, addNote, updateNote, deleteNote, isLoaded };
}

// ---------------------------------------------------------------------------
// Important Resources
// ---------------------------------------------------------------------------
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");
      const data = await res.json();
      setResources(data.map(mapId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (resource: Omit<Resource, "id" | "createdAt">) => {
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resource),
    });
    if (!res.ok) throw new Error("Failed to create resource");
    const created = mapId(await res.json());
    setResources((prev) => [created, ...prev]);
    return created;
  };

  const deleteResource = async (id: string) => {
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete resource");
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return { resources, addResource, deleteResource, isLoaded };
}
