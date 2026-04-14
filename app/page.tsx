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
  ChevronRight,
  Triangle,
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[240px] bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Header */}
        <div className="px-4 h-14 flex items-center border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Triangle className="w-5 h-5 text-foreground fill-foreground" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">
                TrackMyStuff
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors duration-100 ${
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{config.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-2 py-2 border-t border-sidebar-border">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors duration-100 text-[13px]"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground hidden md:inline">
                  TrackMyStuff
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden md:inline" />
                <span className="font-medium text-foreground">
                  {TAB_CONFIG[activeTab].label}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <div className="w-px h-5 bg-border" />
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 md:px-6 py-6 max-w-5xl">
          {activeTab === "todo" && <Dashboard />}
          {activeTab === "dsa" && <DSALab />}
          {activeTab === "system-design" && <SystemDesign />}
          {activeTab === "notes" && <Notes />}
        </main>
      </div>
    </div>
  );
}
