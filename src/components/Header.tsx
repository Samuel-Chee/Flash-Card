import React from 'react';
import { playSound, setMuted, getMuted } from '../utils/audio';
import { TEMPLATES } from '../utils/storage';
import { 
  LayoutGrid, 
  Plus, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  RotateCcw, 
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onOpenDrawer: () => void;
  onResetWorkspace: () => void;
  totalTasks: number;
  completedTasks: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  activeTemplateId,
  onSelectTemplate,
  onOpenDrawer,
  onResetWorkspace,
  totalTasks,
  completedTasks,
}) => {
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/35 dark:bg-[#0c0d14]/35 backdrop-blur-3xl backdrop-saturate-200 border-b border-white/50 dark:border-white/10 px-4 sm:px-6 py-3 transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
              <LayoutGrid className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  ModularDeck
                </h1>
                <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-white/40 text-neutral-800 dark:bg-white/10 dark:text-neutral-200 border border-white/60 dark:border-white/15 backdrop-blur-xl shadow-2xs">
                  iOS Glass
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium hidden sm:block">
                Tactile Bento Workspace • Transparent Apple System Glass
              </p>
            </div>
          </div>

          {/* Progress pill with iOS liquid styling */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/35 dark:bg-white/[0.06] border border-white/60 dark:border-white/10 shadow-2xs backdrop-blur-2xl">
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block leading-tight">
                Completed
              </span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {completedTasks}/{totalTasks} ({percent}%)
              </span>
            </div>
            <div className="w-12 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Template Selector & Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
          {/* iOS Segmented Layout Selector */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-white/50 dark:border-white/10 backdrop-blur-2xl shadow-2xs">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 px-2 hidden lg:inline flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Layout:
            </span>
            {Object.entries(TEMPLATES).map(([key, t]) => {
              const active = activeTemplateId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    playSound.tap();
                    onSelectTemplate(key);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white/85 text-neutral-900 dark:bg-white/20 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold backdrop-blur-md'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title={t.description}
                >
                  {t.name.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Add Widget Button (iOS Squircle Action) */}
          <button
            type="button"
            onClick={() => {
              playSound.tap();
              onOpenDrawer();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Widgets</span>
          </button>

          {/* Sound Toggle (iOS Frosted Squircle) */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-2xl border transition-all cursor-pointer backdrop-blur-2xl ${
              soundEnabled
                ? 'bg-white/50 border-white/70 text-neutral-900 dark:bg-white/10 dark:border-white/15 dark:text-neutral-100 shadow-2xs'
                : 'bg-black/5 border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
            title={soundEnabled ? 'Tactile Sound: ON' : 'Tactile Sound: MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs backdrop-blur-2xl active:scale-95"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />}
          </button>

          {/* Reset Workspace */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset workspace widgets and tasks to original defaults?')) {
                playSound.tap();
                onResetWorkspace();
              }
            }}
            className="p-2 rounded-2xl border border-white/60 dark:border-white/10 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-all cursor-pointer backdrop-blur-2xl active:scale-95"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
