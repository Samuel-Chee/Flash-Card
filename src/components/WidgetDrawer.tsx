import React from 'react';
import { WidgetConfig, WidgetType } from '../types';
import { playSound } from '../utils/audio';
import { 
  X, 
  Calendar, 
  CreditCard, 
  ListOrdered, 
  StickyNote, 
  Timer, 
  Trophy, 
  Plus, 
  Check 
} from 'lucide-react';

interface WidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: WidgetConfig[];
  onAddWidget: (type: WidgetType) => void;
  onRemoveWidget: (id: string) => void;
}

const AVAILABLE_WIDGETS: {
  type: WidgetType;
  title: string;
  description: string;
  defaultColSpan: number;
  defaultRowSpan: number;
  icon: React.ReactNode;
  badge: string;
}[] = [
  {
    type: 'flashcard',
    title: 'To Do List',
    description: 'Modular database board with editable columns, direct card renaming, hover-add, formatting toolbar, and drag-and-drop workflow.',
    defaultColSpan: 4,
    defaultRowSpan: 2,
    icon: <CreditCard className="w-5 h-5 text-violet-500" />,
    badge: 'Core Frame',
  },
  {
    type: 'focus_timer',
    title: 'Focus Flow Timer',
    description: 'Tactile Pomodoro timer directly linked to the current top card.',
    defaultColSpan: 2,
    defaultRowSpan: 1,
    icon: <Timer className="w-5 h-5 text-rose-500" />,
    badge: 'Focus Widget',
  },
  {
    type: 'habit_tracker',
    title: 'Daily Habit Tracker',
    description: 'Physical daily check-off routines with streak counters.',
    defaultColSpan: 2,
    defaultRowSpan: 1,
    icon: <Trophy className="w-5 h-5 text-teal-500" />,
    badge: 'Routine Widget',
  },
];

export const WidgetDrawer: React.FC<WidgetDrawerProps> = ({
  isOpen,
  onClose,
  activeWidgets,
  onAddWidget,
  onRemoveWidget,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 dark:bg-black/50 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white/40 dark:bg-[#0e0f17]/50 backdrop-blur-3xl backdrop-saturate-200 h-full shadow-[0_0_60px_rgba(0,0,0,0.35)] flex flex-col border-l border-white/60 dark:border-white/15 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Widget Library
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Drag or tap to add modular Bento frames to your canvas
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound.tap();
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Widgets */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {AVAILABLE_WIDGETS.map((item) => {
            const existing = activeWidgets.find(w => w.type === item.type);
            return (
              <div
                key={item.type}
                className="p-4 rounded-2xl border border-white/60 dark:border-white/10 bg-white/45 dark:bg-white/[0.05] backdrop-blur-2xl flex flex-col justify-between gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.02),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/90 dark:hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/70 dark:border-white/15 shadow-2xs shrink-0 text-neutral-900 dark:text-white backdrop-blur-md">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/50 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 font-medium border border-white/50 dark:border-white/10">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Size: {item.defaultColSpan}x{item.defaultRowSpan} Bento
                  </span>

                  {existing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playSound.tap();
                          onRemoveWidget(existing.id);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playSound.cardDrop();
                        onAddWidget(item.type);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 shadow-[0_2px_8px_rgba(0,0,0,0.12)] cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Board</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
