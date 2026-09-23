/**
 * ModularDeck — Modular Canvas Workspace
 * Notion modular freedom + iOS visual widget grid + tactile physical-digital cards
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WorkspaceState, Task, WidgetConfig, WidgetType } from './types';
import { loadWorkspace, saveWorkspace, getDefaultWorkspace, TEMPLATES } from './utils/storage';
import { playSound, setMuted } from './utils/audio';
import { Header } from './components/Header';
import { BentoGrid } from './components/BentoGrid';
import { WidgetDrawer } from './components/WidgetDrawer';
import { Sparkles, Layers, Info, Check } from 'lucide-react';

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadWorkspace());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  // Sync theme to root DOM
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    playSound.tap();
    setDarkMode(prev => !prev);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setMuted(!next);
    if (next) playSound.tap();
  };

  // Task operations
  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };

    setWorkspace(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  }, []);

  const handleUpdateTask = useCallback((id: string, updates: Partial<Task>) => {
    setWorkspace(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setWorkspace(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  // Scratchpad
  const handleChangeScratchpadText = (text: string) => {
    setWorkspace(prev => ({ ...prev, scratchpadText: text }));
  };

  const handleChangeScratchpadColor = (color: string) => {
    setWorkspace(prev => ({ ...prev, scratchpadColor: color }));
  };

  // Habits
  const handleToggleHabit = (id: string) => {
    setWorkspace(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      }),
    }));
  };

  // Widget management
  const handleReorderWidgets = (startIndex: number, endIndex: number) => {
    setWorkspace(prev => {
      const result = Array.from(prev.widgets);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, widgets: result };
    });
  };

  const handleResizeWidget = (widgetId: string, colSpan: number, rowSpan: number) => {
    setWorkspace(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, colSpan, rowSpan } : w
      ),
    }));
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWorkspace(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
    }));
  };

  const handleRenameWidget = (widgetId: string, newTitle: string) => {
    setWorkspace(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, title: newTitle } : w
      ),
    }));
  };

  const handleAddWidget = (type: WidgetType) => {
    const titles: Record<WidgetType, string> = {
      calendar: 'Interactive Calendar',
      flashcard: 'To Do List',
      status_buckets: 'Status Buckets',
      scratchpad: 'Quick Scratchpad',
      focus_timer: 'Focus Flow Timer',
      habit_tracker: 'Daily Habit Tracker',
    };

    const newWidget: WidgetConfig = {
      id: `widget-${type}-${Date.now()}`,
      type,
      title: titles[type],
      colSpan: type === 'calendar' || type === 'flashcard' ? 2 : 2,
      rowSpan: type === 'calendar' || type === 'flashcard' ? 2 : 1,
    };

    setWorkspace(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));
    setIsDrawerOpen(false);
  };

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = TEMPLATES[templateId];
    if (!tmpl) return;

    setWorkspace(prev => ({
      ...prev,
      activeTemplateId: templateId,
      widgets: tmpl.widgets.map(w => ({ ...w, id: `${w.id}-${Date.now()}` })),
    }));
  };

  const handleResetWorkspace = () => {
    setWorkspace(getDefaultWorkspace());
  };

  const totalTasks = workspace.tasks.length;
  const completedTasks = workspace.tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="relative min-h-screen bg-[#ECEEF2] dark:bg-[#07080C] text-neutral-900 dark:text-neutral-100 font-sans transition-colors flex flex-col selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 overflow-x-hidden">
      {/* Dynamic Moving Background (动态 Background) with iOS Ambient Refraction Mesh Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* LIGHT MODE: Dynamic floating, morphing, and rotating iOS 18 refraction orbs */}
        <div className="dark:hidden absolute inset-0 animate-mesh-pulse">
          {/* Orb 1: Vibrant Iris / Indigo */}
          <div className="absolute -top-[12%] left-[4%] w-[52vw] h-[52vw] rounded-full bg-gradient-to-br from-indigo-400/40 via-sky-300/35 to-blue-200/25 blur-[95px] animate-orb-1" />
          {/* Orb 2: Sunset Coral / Rose */}
          <div className="absolute top-[18%] -right-[8%] w-[54vw] h-[54vw] rounded-full bg-gradient-to-bl from-rose-400/40 via-fuchsia-300/35 to-amber-200/25 blur-[110px] animate-orb-2" />
          {/* Orb 3: Fresh Emerald / Mint / Sky */}
          <div className="absolute top-[48%] left-[10%] w-[46vw] h-[46vw] rounded-full bg-gradient-to-tr from-teal-300/35 via-emerald-300/30 to-sky-300/35 blur-[100px] animate-orb-3" />
          {/* Orb 4: Deep Lavender / Violet Glow */}
          <div className="absolute -bottom-[8%] right-[8%] w-[58vw] h-[58vw] rounded-full bg-gradient-to-tl from-purple-400/40 via-indigo-300/35 to-pink-300/25 blur-[110px] animate-orb-4" />
          {/* Orb 5: Warm Sunbeam Accent Center */}
          <div className="absolute top-[32%] left-[40%] w-[38vw] h-[38vw] rounded-full bg-gradient-to-r from-amber-300/30 via-orange-200/25 to-pink-200/25 blur-[90px] animate-orb-5" />
        </div>

        {/* DARK MODE: Dynamic deep luminous VisionOS floating auroras */}
        <div className="hidden dark:block absolute inset-0 animate-mesh-pulse">
          {/* Orb 1: Royal Electric Blue */}
          <div className="absolute -top-[12%] left-[4%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-[115px] animate-orb-1" />
          {/* Orb 2: Radiant Nebula Magenta */}
          <div className="absolute top-[18%] -right-[8%] w-[56vw] h-[56vw] rounded-full bg-gradient-to-bl from-purple-600/30 via-fuchsia-600/25 to-transparent blur-[125px] animate-orb-2" />
          {/* Orb 3: Cosmic Cyan / Aurora */}
          <div className="absolute top-[48%] left-[10%] w-[48vw] h-[48vw] rounded-full bg-gradient-to-tr from-cyan-500/25 via-teal-500/15 to-transparent blur-[110px] animate-orb-3" />
          {/* Orb 4: Deep Violet Night */}
          <div className="absolute -bottom-[8%] right-[8%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-violet-600/30 via-indigo-800/25 to-transparent blur-[125px] animate-orb-4" />
          {/* Orb 5: Deep Electric Azure Core */}
          <div className="absolute top-[32%] left-[38%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-sky-600/20 via-blue-700/15 to-transparent blur-[95px] animate-orb-5" />
        </div>
      </div>

      {/* Top Navigation */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        activeTemplateId={workspace.activeTemplateId}
        onSelectTemplate={handleSelectTemplate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
      />

      {/* Tactile Interaction Quick Guide Banner (iOS Frosted Capsule) */}
      {!bannerDismissed && (
        <div className="relative z-20 px-4 sm:px-6 pt-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-800 dark:text-neutral-200 ios-glass rounded-2xl px-4 py-2.5 transition-all shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold tracking-tight">iOS Glass Workspace:</span>
              <span className="text-neutral-600 dark:text-neutral-300 hidden sm:inline">
                Tap anywhere to edit titles • <strong className="text-neutral-900 dark:text-white font-semibold">Add Card</strong> in full view • <strong className="text-neutral-900 dark:text-white font-semibold">Filter</strong> by keywords & dates • <strong className="text-neutral-900 dark:text-white font-semibold">Customize</strong> colors & words
              </span>
            </div>
            <button
              type="button"
              onClick={() => { playSound.tap(); setBannerDismissed(true); }}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:underline cursor-pointer px-2 py-0.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <main className="relative z-10 flex-1 pb-16">
        <BentoGrid
          widgets={workspace.widgets}
          tasks={workspace.tasks}
          scratchpadText={workspace.scratchpadText}
          scratchpadColor={workspace.scratchpadColor}
          habits={workspace.habits}
          onUpdateTasks={(tasks) => setWorkspace(prev => ({ ...prev, tasks }))}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onChangeScratchpadText={handleChangeScratchpadText}
          onChangeScratchpadColor={handleChangeScratchpadColor}
          onToggleHabit={handleToggleHabit}
          onReorderWidgets={handleReorderWidgets}
          onResizeWidget={handleResizeWidget}
          onRemoveWidget={handleRemoveWidget}
          onRenameWidget={handleRenameWidget}
        />
      </main>

      {/* Widget Library Drawer */}
      <WidgetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeWidgets={workspace.widgets}
        onAddWidget={handleAddWidget}
        onRemoveWidget={handleRemoveWidget}
      />
    </div>
  );
}
