import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Play, Pause, RotateCcw, Timer, Flame } from 'lucide-react';
import { Task } from '../../types';

interface FocusTimerWidgetProps {
  currentTask?: Task;
}

export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = ({ currentTask }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playSound.taskComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    playSound.tap();
    setIsRunning(prev => !prev);
  };

  const resetTimer = (minutes: number) => {
    playSound.tap();
    setIsRunning(false);
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  return (
    <div id="focus-timer-container" className="flex flex-col h-full justify-between select-none p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white/50 dark:bg-white/10 text-neutral-900 dark:text-white border border-white/60 dark:border-white/10 backdrop-blur-md shadow-2xs">
            <Timer className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif]">
            Tactile Focus Flow
          </span>
        </div>

        {/* Duration presets in iOS Glass Capsule */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-white/50 dark:border-white/10 backdrop-blur-md shadow-2xs">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => resetTimer(mins)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                selectedDuration === mins
                  ? 'bg-white text-neutral-900 dark:bg-white/20 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Center Dial / Digits */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative flex items-center justify-center">
          <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-neutral-900 dark:text-white drop-shadow-xs">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Focus on target flashcard */}
        {currentTask && (
          <div className="mt-2 text-center max-w-[220px] px-3 py-1 rounded-xl bg-white/40 dark:bg-white/[0.05] border border-white/60 dark:border-white/10 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" /> Focus Card
            </span>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {currentTask.title}
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-[180px] h-1.5 bg-black/5 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
        <button
          type="button"
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-95 cursor-pointer ${
            isRunning 
              ? 'bg-neutral-800 hover:bg-neutral-900 text-white dark:bg-neutral-200 dark:hover:bg-white dark:text-neutral-900' 
              : 'bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause' : 'Start Flow'}</span>
        </button>

        <button
          type="button"
          onClick={() => resetTimer(selectedDuration)}
          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
