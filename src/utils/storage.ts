import { Task, WidgetConfig, WorkspaceState } from '../types';

export const STORAGE_KEY = 'modulardeck_workspace_v1';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}-${m}-${y}`;
}

export function getDefaultTasks(): Task[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const inFourDays = new Date(today);
  inFourDays.setDate(inFourDays.getDate() + 4);

  return [
    {
      id: 'task-1',
      title: 'Review quarterly budget proposal',
      description: 'Check department allocations, team headcount adjustments, and software subscriptions.',
      status: 'in_progress',
      priority: 'high',
      tags: ['Work', 'Finance'],
      project: 'Finance',
      context: '@Work',
      dueDate: formatDate(today),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design high-fidelity Bento Box prototypes',
      description: 'Polish card elevation, rounded 20px corners, and calendar sync micro-interactions.',
      status: 'todo',
      priority: 'high',
      tags: ['Design', 'Work'],
      project: 'Design',
      context: '@Work',
      dueDate: formatDate(tomorrow),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Grocery run: farmers market fresh greens',
      description: 'Sourdough bread, cold-pressed olive oil, avocados, and oat milk.',
      status: 'todo',
      priority: 'medium',
      tags: ['Personal', 'Health'],
      project: 'Personal',
      context: '@Errands',
      dueDate: formatDate(dayAfter),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Call mechanical keyboard vendor regarding switches',
      description: 'Confirm sound dampening pads and lubrication specs.',
      status: 'completed',
      priority: 'low',
      tags: ['Personal'],
      project: 'Personal',
      context: '@Home',
      dueDate: formatDate(today),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Submit quarterly tax estimates',
      description: 'Download bank statements and reconcile invoices.',
      status: 'todo',
      priority: 'high',
      tags: ['Urgent', 'Finance'],
      project: 'Finance',
      context: '@Desk',
      dueDate: formatDate(inFourDays),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Weekend 10k trail run preparation',
      description: 'Hydration vest, electrolyte tablets, route map check.',
      status: 'todo',
      priority: 'low',
      tags: ['Health'],
      project: 'Personal',
      context: '@Home',
      dueDate: null,
      createdAt: new Date().toISOString(),
    }
  ];
}

export const TEMPLATES: Record<string, { name: string; description: string; widgets: WidgetConfig[] }> = {
  daily_planner: {
    name: 'To Do List Canvas',
    description: 'Full-width modular To Do List database board with customizable columns and tactile cards.',
    widgets: [
      {
        id: 'widget-flashcards',
        type: 'flashcard',
        title: 'To Do List',
        colSpan: 4,
        rowSpan: 2,
      }
    ]
  },
  deep_work: {
    name: 'Focus & Tasks',
    description: 'To Do List paired with a tactile focus timer.',
    widgets: [
      {
        id: 'widget-flashcards',
        type: 'flashcard',
        title: 'To Do List',
        colSpan: 4,
        rowSpan: 2,
      },
      {
        id: 'widget-focus-timer',
        type: 'focus_timer',
        title: 'Tactile Focus Timer',
        colSpan: 2,
        rowSpan: 1,
      }
    ]
  },
  project_overview: {
    name: 'Habits & Tasks',
    description: 'To Do List paired with daily habit tracking.',
    widgets: [
      {
        id: 'widget-flashcards',
        type: 'flashcard',
        title: 'To Do List',
        colSpan: 4,
        rowSpan: 2,
      },
      {
        id: 'widget-habits',
        type: 'habit_tracker',
        title: 'Daily Habit Tracker',
        colSpan: 2,
        rowSpan: 1,
      }
    ]
  }
};

export function getDefaultWorkspace(): WorkspaceState {
  return {
    widgets: TEMPLATES.daily_planner.widgets,
    tasks: getDefaultTasks(),
    scratchpadText: '',
    scratchpadColor: '#FEF9C3',
    habits: [
      { id: 'h-1', title: 'Drink 2L Spring Water', targetDays: 7, completedToday: true, streak: 5 },
      { id: 'h-2', title: '30 Min Deep Reading', targetDays: 5, completedToday: false, streak: 3 },
      { id: 'h-3', title: 'Posture & Mobility Stretch', targetDays: 7, completedToday: true, streak: 12 },
    ],
    activeTemplateId: 'daily_planner',
  };
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultWorkspace();
    const parsed = JSON.parse(raw);
    if (!parsed.widgets || !parsed.tasks) return getDefaultWorkspace();
    
    // Filter out removed widgets: interactive calendar, quick scratchpad, and status buckets
    parsed.widgets = parsed.widgets.filter((w: WidgetConfig) => 
      w.type !== 'calendar' && w.type !== 'scratchpad' && w.type !== 'status_buckets'
    );

    // If no flashcard widget remains, create it
    const hasFlashcard = parsed.widgets.some((w: WidgetConfig) => w.type === 'flashcard');
    if (!hasFlashcard) {
      parsed.widgets.unshift({
        id: 'widget-flashcards',
        type: 'flashcard',
        title: 'To Do List',
        colSpan: 4,
        rowSpan: 2,
      });
    } else {
      parsed.widgets = parsed.widgets.map((w: WidgetConfig) => {
        if (w.type === 'flashcard') {
          return {
            ...w,
            title: w.title || 'To Do List',
            colSpan: 4, // expand to full width
          };
        }
        return w;
      });
    }

    return parsed;
  } catch {
    return getDefaultWorkspace();
  }
}

export function saveWorkspace(state: WorkspaceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}
