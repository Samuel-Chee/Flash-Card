import React, { useState } from 'react';
import { playSound } from '../../utils/audio';
import { Check, Flame, Trophy, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface HabitItem {
  id: string;
  title: string;
  targetDays: number;
  completedToday: boolean;
  streak: number;
}

interface HabitTrackerWidgetProps {
  habits: HabitItem[];
  onToggleHabit: (id: string) => void;
  onUpdateHabitTitle?: (id: string, newTitle: string) => void;
}

export const HabitTrackerWidget: React.FC<HabitTrackerWidgetProps> = ({
  habits,
  onToggleHabit,
  onUpdateHabitTitle,
}) => {
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [localTitles, setLocalTitles] = useState<Record<string, string>>({});

  const handleToggle = (habit: HabitItem) => {
    if (!habit.completedToday) {
      playSound.taskComplete();
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 }
      });
    } else {
      playSound.tap();
    }
    onToggleHabit(habit.id);
  };

  const handleSaveTitle = (id: string) => {
    if (editingTitle.trim()) {
      setLocalTitles(prev => ({ ...prev, [id]: editingTitle.trim() }));
      if (onUpdateHabitTitle) {
        onUpdateHabitTitle(id, editingTitle.trim());
      }
      playSound.tap();
    }
    setEditingHabitId(null);
  };

  return (
    <div id="habit-tracker-container" className="flex flex-col h-full justify-between select-none p-1">
      <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white/50 dark:bg-white/10 text-neutral-900 dark:text-white border border-white/60 dark:border-white/10 backdrop-blur-md shadow-2xs">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
            Daily Habits
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-900 dark:text-neutral-100 font-bold bg-white/50 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-white/60 dark:border-white/10 shadow-2xs backdrop-blur-md">
          {habits.filter(h => h.completedToday).length}/{habits.length} Done
        </span>
      </div>

      <div className="my-auto flex flex-col gap-2 py-2">
        {habits.map((h) => {
          const displayTitle = localTitles[h.id] || h.title;
          const isEditing = editingHabitId === h.id;

          return (
            <div
              key={h.id}
              onClick={() => {
                if (!isEditing) handleToggle(h);
              }}
              className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer backdrop-blur-xl ${
                h.completedToday
                  ? 'bg-white/30 dark:bg-white/[0.04] border-white/50 dark:border-white/10 opacity-75 shadow-2xs'
                  : 'bg-white/50 dark:bg-white/[0.07] border-white/70 dark:border-white/15 hover:bg-white/60 dark:hover:bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(h);
                  }}
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-150 shrink-0 cursor-pointer ${
                    h.completedToday
                      ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-2xs scale-95'
                      : 'bg-white/60 dark:bg-white/5 border-neutral-300 dark:border-neutral-600 hover:border-neutral-700 dark:hover:border-neutral-300'
                  }`}
                >
                  {h.completedToday && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(h.id);
                      if (e.key === 'Escape') setEditingHabitId(null);
                    }}
                    onBlur={() => handleSaveTitle(h.id)}
                    className="w-full text-xs font-semibold px-2 py-1 rounded-xl border border-neutral-900 dark:border-white bg-white/80 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden shadow-2xs"
                  />
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingHabitId(h.id);
                      setEditingTitle(displayTitle);
                    }}
                    title="Click to edit title (press Enter or tap anywhere to save)"
                    className={`text-xs font-semibold truncate hover:underline ${
                      h.completedToday
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}
                  >
                    {displayTitle}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0 text-neutral-800 dark:text-neutral-200 text-xs font-bold font-mono bg-white/50 dark:bg-white/10 px-2.5 py-0.5 rounded-xl border border-white/60 dark:border-white/10 backdrop-blur-md shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{h.streak}d</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 text-center pt-2 border-t border-black/[0.04] dark:border-white/[0.06] font-mono">
        Tap title to edit (press Enter or tap away to save) • Tap box to check off
      </div>
    </div>
  );
};
