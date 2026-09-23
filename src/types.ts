export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TagType = 'project' | 'context' | 'label';

export interface TaskTag {
  id: string;
  name: string;
  color: string; // Hex color (e.g., '#2563eb', '#10b981')
  type: TagType; // 'project' | 'context' | 'label'
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  tagObjects?: TaskTag[];
  project?: string; // Project grouping (e.g. 'Finance', 'Bento Redesign')
  context?: string; // Context grouping (e.g. '@Work', '@Home', '@Errands', '@Desk')
  tagColorMap?: Record<string, string>;
  dueDate: string | null; // ISO string 'YYYY-MM-DD' or null
  createdAt: string;
  completedAt?: string;
  columnId?: string;
  textColor?: string;
  bgColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  fontStyle?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | string;
}

export interface DatabaseColumn {
  id: string;
  title: string;
  statusMatch?: TaskStatus;
  color?: string;
}

export type WidgetType = 
  | 'calendar' 
  | 'flashcard' 
  | 'status_buckets' 
  | 'scratchpad' 
  | 'focus_timer'
  | 'habit_tracker';

export type WidgetSize = 'compact' | 'standard' | 'wide' | 'tall' | 'large';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  colSpan: number; // 1 to 4 columns in bento grid
  rowSpan: number; // 1 to 3 rows
  colorTheme?: string;
  customData?: Record<string, any>;
}

export interface WorkspaceState {
  widgets: WidgetConfig[];
  tasks: Task[];
  scratchpadText: string;
  scratchpadColor: string;
  habits: {
    id: string;
    title: string;
    targetDays: number;
    completedToday: boolean;
    streak: number;
  }[];
  activeTemplateId: string;
}

export type DragPayload = 
  | { type: 'TASK'; taskId: string }
  | { type: 'WIDGET'; widgetId: string };
