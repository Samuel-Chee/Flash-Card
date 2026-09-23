import React, { useState } from 'react';
import { playSound } from '../../utils/audio';
import { StickyNote, Sparkles, CheckSquare, Palette } from 'lucide-react';
import { Task } from '../../types';

interface ScratchpadWidgetProps {
  text: string;
  color: string;
  onChangeText: (text: string) => void;
  onChangeColor: (color: string) => void;
  onConvertToCard: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const PASTEL_COLORS = [
  { name: 'Warm Butter', value: '#FEF3C7', darkValue: '#78350F' },
  { name: 'Pastel Mint', value: '#DCFCE7', darkValue: '#064E3B' },
  { name: 'Soft Lavender', value: '#F3E8FF', darkValue: '#581C87' },
  { name: 'Sky Powder', value: '#E0F2FE', darkValue: '#0C4A6E' },
  { name: 'Peach Cream', value: '#FFEDD5', darkValue: '#7C2D12' },
];

export const ScratchpadWidget: React.FC<ScratchpadWidgetProps> = ({
  text,
  color,
  onChangeText,
  onChangeColor,
  onConvertToCard,
}) => {
  const [showPalette, setShowPalette] = useState(false);

  const handleConvertLine = (line: string) => {
    const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
    if (!clean) return;

    onConvertToCard({
      title: clean,
      status: 'todo',
      priority: 'medium',
      tags: ['Idea'],
      dueDate: null,
    });
    playSound.cardDrop();

    // Remove that converted line from scratchpad
    const updated = text
      .split('\n')
      .filter(l => l.trim() !== line.trim())
      .join('\n');
    onChangeText(updated);
  };

  const lines = text.split('\n').filter(l => l.trim().length > 0);

  return (
    <div 
      id="scratchpad-widget-container" 
      className="flex flex-col h-full rounded-2xl p-4 transition-colors duration-200 shadow-xs border border-amber-200/60 dark:border-amber-900/30"
      style={{ backgroundColor: color }}
    >
      {/* Scratchpad Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-amber-800 dark:text-amber-200" />
          <span className="text-xs font-bold text-amber-900 dark:text-amber-100 tracking-tight">
            Frictionless Scratchpad
          </span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          <button
            type="button"
            onClick={() => setShowPalette(prev => !prev)}
            className="p-1 rounded-md hover:bg-black/5 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
            title="Change sticky note shade"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showPalette && (
            <div className="absolute right-0 top-7 z-30 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex gap-1.5 animate-in fade-in zoom-in-95">
              {PASTEL_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    playSound.tap();
                    onChangeColor(c.value);
                    setShowPalette(false);
                  }}
                  className="w-5 h-5 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Textarea Area */}
      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Type fast thoughts, unorganized brain dumps, or snippets here... (You can convert any thought into a flashcard with one click below)"
        className="w-full flex-1 bg-transparent text-xs text-amber-950 dark:text-amber-100 placeholder:text-amber-900/40 outline-hidden resize-none leading-relaxed font-sans"
      />

      {/* Quick Convert Helper Chips */}
      {lines.length > 0 && (
        <div className="pt-2 mt-1 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 overflow-x-auto text-[10px]">
          <span className="text-amber-900/70 dark:text-amber-200/70 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-300" />
            Turn thought into card:
          </span>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {lines.slice(0, 2).map((line, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleConvertLine(line)}
                className="px-2 py-0.5 rounded-md bg-white/70 hover:bg-white text-amber-950 dark:bg-black/30 dark:text-amber-100 font-medium truncate max-w-[140px] cursor-pointer shadow-2xs transition-all hover:scale-102"
                title={`Convert "${line}" to Flashcard`}
              >
                + "{line}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
