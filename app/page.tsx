"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/dashboard";
import { DSALab } from "@/components/dsa-lab";
import { SystemDesign } from "@/components/system-design";
import { Notes } from "@/components/notes";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  Moon,
  Sun,
  LayoutDashboard,
  Code2,
  Layers,
  StickyNote,
  Search,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tab = "todo" | "dsa" | "system-design" | "notes";

const TAB_CONFIG: Record<
  Tab,
  { label: string; icon: LucideIcon; description: string }
> = {
  todo: {
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Tasks & Resources",
  },
  dsa: { label: "DSA Lab", icon: Code2, description: "Problem Tracker" },
  "system-design": {
    label: "System Design",
    icon: Layers,
    description: "Architecture Notes",
  },
  notes: {
    label: "Notes",
    icon: StickyNote,
    description: "Tips & Strategies",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("todo");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration-safe dark mode
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("nexus-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("nexus-theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Header */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <span className="font-bold text-accent text-sm">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-sm text-foreground">
                TrackMyStuff
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Learning Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="mb-2 px-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Main Menu
            </span>
          </div>
          <nav className="space-y-0.5">
            {(
              Object.entries(TAB_CONFIG) as [Tab, (typeof TAB_CONFIG)[Tab]][]
            ).map(([tab, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-accent/10 text-accent font-medium shadow-[0_0_0_1px_rgba(74,144,217,0.15)]"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-accent" : ""}`}
                  />
                  <span className="truncate">{config.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-150 text-sm"
          >
            {isDark ? (
              <>
                <Sun className="w-[18px] h-[18px]" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-[18px] h-[18px]" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <div className="text-[10px] text-muted-foreground/60 px-3 py-1 font-mono">
            v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center justify-between h-14 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">TrackMyStuff</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                <span className="font-medium text-foreground">
                  {TAB_CONFIG[activeTab].label}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <div className="w-px h-6 bg-border/60" />
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 md:px-8 py-6 md:py-8 max-w-6xl">
          {activeTab === "todo" && <Dashboard />}
          {activeTab === "dsa" && <DSALab />}
          {activeTab === "system-design" && <SystemDesign />}
          {activeTab === "notes" && <Notes />}
        </main>
      </div>
    </div>
  );
}
