import React, { useState } from 'react';
import { WidgetConfig, Task, WorkspaceState, TaskStatus } from '../types';
import { FlashcardWidget } from './widgets/FlashcardWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { StatusBucketsWidget } from './widgets/StatusBucketsWidget';
import { ScratchpadWidget } from './widgets/ScratchpadWidget';
import { FocusTimerWidget } from './widgets/FocusTimerWidget';
import { HabitTrackerWidget } from './widgets/HabitTrackerWidget';
import { playSound } from '../utils/audio';
import { 
  GripHorizontal, 
  Maximize2, 
  Minimize2, 
  X, 
  Move,
  Sparkles,
  Edit2,
  Check
} from 'lucide-react';

interface BentoGridProps {
  widgets: WidgetConfig[];
  tasks: Task[];
  scratchpadText: string;
  scratchpadColor: string;
  habits: WorkspaceState['habits'];
  onUpdateTasks: (tasks: Task[]) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onChangeScratchpadText: (text: string) => void;
  onChangeScratchpadColor: (color: string) => void;
  onToggleHabit: (id: string) => void;
  onReorderWidgets: (startIndex: number, endIndex: number) => void;
  onResizeWidget: (widgetId: string, colSpan: number, rowSpan: number) => void;
  onRemoveWidget: (widgetId: string) => void;
  onRenameWidget?: (widgetId: string, newTitle: string) => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  widgets,
  tasks,
  scratchpadText,
  scratchpadColor,
  habits,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onChangeScratchpadText,
  onChangeScratchpadColor,
  onToggleHabit,
  onReorderWidgets,
  onResizeWidget,
  onRemoveWidget,
  onRenameWidget,
}) => {
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingTitleWidgetId, setEditingTitleWidgetId] = useState<string | null>(null);
  const [widgetTitleInput, setWidgetTitleInput] = useState('');

  // Widget Drag & Drop reordering
  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string, index: number) => {
    playSound.cardPickup();
    setDraggedWidgetId(widgetId);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'WIDGET', widgetId, index }));
  };

  const handleWidgetDragOver = (e: React.DragEvent, targetIndex: number) => {
    // Only accept widget reordering
    e.preventDefault();
    if (draggedWidgetId && dragOverIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleWidgetDragLeave = () => {
    // setDragOverIndex(null);
  };

  const handleWidgetDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedWidgetId(null);

    try {
      const raw = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(raw);
      if (data && data.type === 'WIDGET' && typeof data.index === 'number') {
        if (data.index !== targetIndex) {
          playSound.cardDrop();
          onReorderWidgets(data.index, targetIndex);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleCycleSize = (w: WidgetConfig) => {
    playSound.tap();
    // Cycle colSpan between 1, 2, 3, 4
    const nextCol = w.colSpan >= 4 ? 1 : (w.colSpan === 1 ? 2 : (w.colSpan === 2 ? 3 : 4));
    onResizeWidget(w.id, nextCol, w.rowSpan);
  };

  const getColSpanClass = (span: number) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 md:col-span-2';
      case 3:
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 4:
      default:
        return 'col-span-1 md:col-span-2 lg:col-span-4';
    }
  };

  const getRowSpanClass = (span: number) => {
    switch (span) {
      case 2:
        return 'row-span-2 min-h-[380px]';
      case 3:
        return 'row-span-3 min-h-[540px]';
      case 1:
      default:
        return 'row-span-1 min-h-[220px]';
    }
  };

  const topFlashcard = tasks.find(t => t.status !== 'completed') || tasks[0];

  return (
    <div id="bento-grid-canvas" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-auto">
        {widgets.map((widget, index) => {
          const isBeingDragged = draggedWidgetId === widget.id;
          const isDropTarget = dragOverIndex === index;

          return (
            <div
              key={widget.id}
              id={`frame-${widget.id}`}
              onDragOver={(e) => handleWidgetDragOver(e, index)}
              onDragLeave={handleWidgetDragLeave}
              onDrop={(e) => handleWidgetDrop(e, index)}
              className={`group/frame relative flex flex-col rounded-[28px] transition-all duration-300 p-4 sm:p-5 ${
                getColSpanClass(widget.colSpan)
              } ${
                getRowSpanClass(widget.rowSpan)
              } ${
                isBeingDragged ? 'opacity-40 scale-95 border-dashed border-neutral-400' : ''
              } ${
                isDropTarget ? 'ring-2 ring-neutral-900 dark:ring-white scale-[1.01]' : ''
              } ${
                widget.type === 'flashcard' ? 'z-20' : 'z-10'
              } hover:z-30 focus-within:z-30 bg-white/30 dark:bg-white/[0.04] backdrop-blur-3xl backdrop-saturate-200 border border-white/60 dark:border-white/15 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_50px_-6px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.18)] hover:shadow-[0_20px_50px_-8px_rgba(0,0,0,0.08)]`}
            >
              {/* Frame Top Drag Handle & Quick Resizer */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div 
                    draggable
                    onDragStart={(e) => handleWidgetDragStart(e, widget.id, index)}
                    className="flex items-center cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    title="Drag to rearrange frame on Bento grid"
                  >
                    <GripHorizontal className="w-4 h-4" />
                  </div>

                  {editingTitleWidgetId === widget.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={widgetTitleInput}
                        onChange={(e) => setWidgetTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (widgetTitleInput.trim()) {
                              onRenameWidget?.(widget.id, widgetTitleInput.trim());
                              playSound.tap();
                            }
                            setEditingTitleWidgetId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTitleWidgetId(null);
                          }
                        }}
                        onBlur={() => {
                          if (widgetTitleInput.trim()) {
                            onRenameWidget?.(widget.id, widgetTitleInput.trim());
                          }
                          setEditingTitleWidgetId(null);
                        }}
                        placeholder="Type new title..."
                        className="text-xs font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-xl border border-neutral-900 dark:border-white bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-hidden shadow-xs"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingTitleWidgetId(widget.id);
                        setWidgetTitleInput(widget.title);
                      }}
                      className="flex items-center gap-2 cursor-pointer group/title hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded-xl transition-all"
                      title="Click to edit title (press Enter or tap anywhere to save)"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-mono transition-colors">
                        {widget.title}
                      </span>
                      <Edit2 className="w-3 h-3 text-neutral-400 opacity-60 group-hover/title:opacity-100 group-hover/title:text-neutral-900 dark:group-hover/title:text-neutral-200 transition-all" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover/frame:opacity-100 transition-opacity">
                  {/* Size Toggle */}
                  <button
                    type="button"
                    onClick={() => handleCycleSize(widget)}
                    className="px-1.5 py-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[10px] font-mono flex items-center gap-1 transition-colors"
                    title={`Current width: ${widget.colSpan} columns. Click to resize.`}
                  >
                    <span>{widget.colSpan}x{widget.rowSpan}</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  {/* Remove Widget */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound.tap();
                      onRemoveWidget(widget.id);
                    }}
                    className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                    title="Remove frame"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Widget Internal Content */}
              <div className="flex-1 min-h-0 pt-1">
                {widget.type === 'flashcard' && (
                  <FlashcardWidget
                    tasks={tasks}
                    onAddTask={onAddTask}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                )}

                {widget.type === 'calendar' && (
                  <CalendarWidget
                    tasks={tasks}
                    onUpdateTask={onUpdateTask}
                    onAddTask={onAddTask}
                  />
                )}

                {widget.type === 'status_buckets' && (
                  <StatusBucketsWidget
                    tasks={tasks}
                    onUpdateTask={onUpdateTask}
                  />
                )}

                {widget.type === 'scratchpad' && (
                  <ScratchpadWidget
                    text={scratchpadText}
                    color={scratchpadColor}
                    onChangeText={onChangeScratchpadText}
                    onChangeColor={onChangeScratchpadColor}
                    onConvertToCard={onAddTask}
                  />
                )}

                {widget.type === 'focus_timer' && (
                  <FocusTimerWidget currentTask={topFlashcard} />
                )}

                {widget.type === 'habit_tracker' && (
                  <HabitTrackerWidget
                    habits={habits}
                    onToggleHabit={onToggleHabit}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
