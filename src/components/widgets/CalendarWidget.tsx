import React, { useState } from 'react';
import { Task } from '../../types';
import { playSound } from '../../utils/audio';
import { getTagStyle } from '../../utils/tagColors';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';

interface CalendarWidgetProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDayTasksModal, setSelectedDayTasksModal] = useState<string | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    playSound.tap();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    playSound.tap();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    playSound.tap();
    setCurrentMonth(new Date());
  };

  // Generate days for Month View
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding to fill complete grid (up to 35 or 42)
  const totalSlots = days.length > 35 ? 42 : 35;
  const remaining = totalSlots - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Filter days for Week View if selected
  const weekDays = (() => {
    const todayIndex = days.findIndex(d => d.isToday);
    const start = todayIndex >= 0 ? Math.max(0, todayIndex - 2) : 0;
    return days.slice(start, start + 7);
  })();

  const displayDays = viewMode === 'week' ? weekDays : days;

  // Drag and drop task onto date cell
  const isDateMatch = (taskDueDate: string | null | undefined, gridDateStr: string) => {
    if (!taskDueDate) return false;
    if (taskDueDate === gridDateStr) return true;
    const parts = taskDueDate.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      // taskDueDate is DD-MM-YYYY, gridDateStr is YYYY-MM-DD
      const ymd = `${parts[2]}-${parts[1]}-${parts[0]}`;
      return ymd === gridDateStr;
    }
    return false;
  };

  const toDMY = (ymd: string) => {
    const parts = ymd.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ymd;
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredDate !== dateStr) {
      setHoveredDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHoveredDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setHoveredDate(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.type === 'TASK' && data.taskId) {
        playSound.cardDrop();
        onUpdateTask(data.taskId, { dueDate: toDMY(dateStr) });
      }
    } catch {
      // Fallback
    }
  };

  const handleQuickAddForDate = (dateStr: string) => {
    if (!quickTaskTitle.trim()) return;
    onAddTask({
      title: quickTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      tags: ['Work'],
      dueDate: toDMY(dateStr),
    });
    playSound.cardDrop();
    setQuickTaskTitle('');
  };

  return (
    <div id="calendar-widget-container" className="flex flex-col h-full select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              {monthNames[month]} {year}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Zero-setup sync active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => { playSound.tap(); setViewMode('month'); }}
              className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : ''
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => { playSound.tap(); setViewMode('week'); }}
              className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : ''
              }`}
            >
              Week
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="px-2 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-slate-400">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid with Drop Target */}
      <div className={`grid grid-cols-7 gap-1 flex-1 ${viewMode === 'week' ? 'grid-rows-1 min-h-[140px]' : 'auto-rows-fr'}`}>
        {displayDays.map((day) => {
          const dayTasks = tasks.filter(t => isDateMatch(t.dueDate, day.dateStr));
          const isTargetHover = hoveredDate === day.dateStr;

          return (
            <div
              key={day.dateStr}
              onDragOver={(e) => handleDragOver(e, day.dateStr)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day.dateStr)}
              onClick={() => setSelectedDayTasksModal(day.dateStr)}
              className={`relative rounded-xl p-1 flex flex-col transition-all cursor-pointer group min-h-[52px] ${
                day.isCurrentMonth 
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200' 
                  : 'bg-slate-50/20 dark:bg-slate-800/10 text-slate-400 dark:text-slate-600'
              } ${
                day.isToday 
                  ? 'ring-2 ring-indigo-500/50 dark:ring-indigo-400/50 bg-indigo-50/40 dark:bg-indigo-950/20' 
                  : ''
              } ${
                isTargetHover 
                  ? 'ring-2 ring-indigo-600 bg-indigo-100/70 dark:bg-indigo-900/60 scale-[1.03] z-20 shadow-md' 
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between text-[11px] font-medium leading-tight px-1">
                <span className={`w-4 h-4 flex items-center justify-center rounded-full ${
                  day.isToday ? 'bg-indigo-600 text-white font-bold' : ''
                }`}>
                  {day.dayNumber}
                </span>

                {dayTasks.length > 0 && (
                  <span className="text-[9px] font-mono text-slate-400">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Task chips list */}
              <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                {dayTasks.slice(0, 2).map((task) => {
                  const tagStyle = task.tags[0] ? getTagStyle(task.tags[0]) : null;
                  return (
                    <div
                      key={task.id}
                      title={`${task.title} (${task.status})`}
                      className={`truncate text-[10px] px-1.5 py-0.5 rounded-md font-medium border flex items-center gap-1 transition-transform ${
                        task.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 line-through opacity-75'
                          : tagStyle
                          ? `${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 2 && (
                  <span className="text-[9px] text-slate-400 font-medium px-1">
                    +{dayTasks.length - 2} more
                  </span>
                )}
              </div>

              {/* Hover snap preview when dragging */}
              {isTargetHover && (
                <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 border-2 border-dashed border-indigo-500 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs">
                    Drop to Schedule
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper cue at bottom */}
      <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Tip: Drag any flashcard onto a date cell to schedule
        </span>
        <span>Click cell to inspect</span>
      </div>

      {/* Modal / Detail Drawer for selected day */}
      {selectedDayTasksModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Tasks for {selectedDayTasksModal}
                </h4>
                <p className="text-xs text-slate-500">
                  {tasks.filter(t => t.dueDate === selectedDayTasksModal).length} scheduled items
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayTasksModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of tasks */}
            <div className="my-4 max-h-60 overflow-y-auto flex flex-col gap-2">
              {tasks.filter(t => isDateMatch(t.dueDate, selectedDayTasksModal)).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No tasks scheduled for this date.
                </p>
              ) : (
                tasks
                  .filter(t => isDateMatch(t.dueDate, selectedDayTasksModal))
                  .map(task => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <button
                          type="button"
                          onClick={() => {
                            const next = task.status === 'completed' ? 'todo' : 'completed';
                            if (next === 'completed') playSound.taskComplete();
                            else playSound.tap();
                            onUpdateTask(task.id, { status: next });
                          }}
                          className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer border ${
                            task.status === 'completed'
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                        <span className={`text-xs font-semibold truncate ${
                          task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Quick add for this date */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Quick add task for this day (press Enter or tap Add)..."
                value={quickTaskTitle}
                onChange={e => setQuickTaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleQuickAddForDate(selectedDayTasksModal);
                }}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden focus:border-neutral-900 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={() => handleQuickAddForDate(selectedDayTasksModal)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer transition-colors"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
