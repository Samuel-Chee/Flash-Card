import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { playSound } from '../../utils/audio';
import { CheckCircle2, Clock, ListTodo, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StatusBucketsWidgetProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onFilterByStatus?: (status: TaskStatus | null) => void;
}

export const StatusBucketsWidget: React.FC<StatusBucketsWidgetProps> = ({
  tasks,
  onUpdateTask,
  onFilterByStatus,
}) => {
  const [activeDragTarget, setActiveDragTarget] = useState<TaskStatus | null>(null);
  const [activeBucketModal, setActiveBucketModal] = useState<TaskStatus | null>(null);

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDragTarget !== status) {
      setActiveDragTarget(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDragTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveDragTarget(null);

    try {
      const raw = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(raw);
      if (data && data.type === 'TASK' && data.taskId) {
        if (targetStatus === 'completed') {
          playSound.taskComplete();
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 }
          });
        } else {
          playSound.cardDrop();
        }

        onUpdateTask(data.taskId, {
          status: targetStatus,
          completedAt: targetStatus === 'completed' ? new Date().toISOString() : undefined,
        });
      }
    } catch {
      // Fallback
    }
  };

  const buckets: {
    status: TaskStatus;
    title: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    accentGlow: string;
    borderActive: string;
    badgeBg: string;
  }[] = [
    {
      status: 'todo',
      title: 'To Do',
      count: todoCount,
      icon: <ListTodo className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      color: 'hover:border-sky-300 dark:hover:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20',
      accentGlow: 'ring-2 ring-sky-500 bg-sky-100/60 dark:bg-sky-900/50 scale-[1.02]',
      borderActive: 'border-sky-400',
      badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      count: inProgressCount,
      icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      color: 'hover:border-amber-300 dark:hover:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20',
      accentGlow: 'ring-2 ring-amber-500 bg-amber-100/60 dark:bg-amber-900/50 scale-[1.02]',
      borderActive: 'border-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      status: 'completed',
      title: 'Completed',
      count: completedCount,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      color: 'hover:border-emerald-300 dark:hover:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
      accentGlow: 'ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/50 scale-[1.02]',
      borderActive: 'border-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
  ];

  return (
    <div id="status-buckets-container" className="flex flex-col h-full justify-between select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Drop Zone Buckets
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Drag cards here to update status
        </span>
      </div>

      {/* 3 Physical Status Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        {buckets.map(b => {
          const isOver = activeDragTarget === b.status;
          return (
            <div
              key={b.status}
              onDragOver={(e) => handleDragOver(e, b.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, b.status)}
              onClick={() => {
                playSound.tap();
                setActiveBucketModal(b.status);
                if (onFilterByStatus) onFilterByStatus(b.status);
              }}
              className={`relative rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer ${b.color} ${
                isOver ? `${b.accentGlow} shadow-lg z-10` : 'shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                    {b.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {b.title}
                  </span>
                </div>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${b.badgeBg}`}>
                  {b.count}
                </span>
              </div>

              {/* Visual Drop Area cue */}
              <div className="mt-2 py-2 px-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isOver ? `Drop to mark ${b.title}!` : `Drag cards here`}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              {/* Glowing Drop feedback overlay */}
              {isOver && (
                <div className="absolute inset-0 rounded-2xl bg-white/20 dark:bg-black/20 pointer-events-none flex items-center justify-center">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
                    + Set to {b.title}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bucket Task Modal */}
      {activeBucketModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  {activeBucketModal.replace('_', ' ')} Tasks
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                  {tasks.filter(t => t.status === activeBucketModal).length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveBucketModal(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer font-medium"
              >
                Close
              </button>
            </div>

            <div className="my-4 max-h-64 overflow-y-auto flex flex-col gap-2">
              {tasks.filter(t => t.status === activeBucketModal).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No cards in this bucket right now.
                </p>
              ) : (
                tasks
                  .filter(t => t.status === activeBucketModal)
                  .map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${
                          task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400">
                            Due: {task.dueDate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {activeBucketModal !== 'todo' && (
                          <button
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              onUpdateTask(task.id, { status: 'todo' });
                            }}
                            className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                          >
                            To Do
                          </button>
                        )}
                        {activeBucketModal !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              onUpdateTask(task.id, { status: 'in_progress' });
                            }}
                            className="text-[10px] font-medium px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 cursor-pointer"
                          >
                            In Progress
                          </button>
                        )}
                        {activeBucketModal !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              playSound.taskComplete();
                              onUpdateTask(task.id, {
                                status: 'completed',
                                completedAt: new Date().toISOString(),
                              });
                            }}
                            className="text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
