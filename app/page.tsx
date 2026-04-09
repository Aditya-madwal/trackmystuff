"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/dashboard";
import { DSALab } from "@/components/dsa-lab";
import { SystemDesign } from "@/components/system-design";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  Moon,
  Sun,
  LayoutDashboard,
  Code2,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tab = "todo" | "dsa" | "system-design";

const TAB_CONFIG: Record<Tab, { label: string; icon: LucideIcon }> = {
  todo: { label: "Dashboard", icon: LayoutDashboard },
  dsa: { label: "DSA Lab", icon: Code2 },
  "system-design": { label: "System Design", icon: Layers },
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
        className={`fixed left-0 top-0 h-screen w-60 bg-card border-r border-border/40 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 py-3.5 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent/15 flex items-center justify-center font-bold text-accent text-sm">
              N
            </div>
            <div>
              <h1 className="font-semibold text-sm">Nexus</h1>
              <p className="text-xs text-muted-foreground">
                Learning Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {(
            Object.entries(TAB_CONFIG) as [Tab, (typeof TAB_CONFIG)[Tab]][]
          ).map(([tab, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{config.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-2 border-t border-border/40 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 transition-colors text-xs"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </>
            )}
          </button>
          <div className="text-xs text-muted-foreground px-3 py-1">
            <p className="font-mono">v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-60">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 border-b border-border/40">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h2 className="text-base font-semibold hidden md:block text-foreground">
                {TAB_CONFIG[activeTab].label}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-1.5 hover:bg-muted rounded-md transition-colors md:hidden"
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 md:px-6 py-5 md:py-6 max-w-6xl mx-auto">
          {activeTab === "todo" && <Dashboard />}
          {activeTab === "dsa" && <DSALab />}
          {activeTab === "system-design" && <SystemDesign />}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 px-4 md:px-6 py-3 mt-8 text-center text-xs text-muted-foreground">
          <p>Built with Next.js • Data persisted locally</p>
        </footer>
      </div>
    </div>
  );
}
