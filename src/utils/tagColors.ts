import { TaskTag, TagType } from '../types';

export interface TagColorPreset {
  id: string;
  name: string;
  hex: string;
  color?: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export const TAG_COLOR_PRESETS: TagColorPreset[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    hex: '#2563eb',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/20',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300/70 dark:border-blue-500/30',
    dotClass: 'bg-blue-600 dark:bg-blue-400',
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    hex: '#4f46e5',
    bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/20',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-300/70 dark:border-indigo-500/30',
    dotClass: 'bg-indigo-600 dark:bg-indigo-400',
  },
  {
    id: 'purple',
    name: 'Vivid Purple',
    hex: '#9333ea',
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/20',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300/70 dark:border-purple-500/30',
    dotClass: 'bg-purple-600 dark:bg-purple-400',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    hex: '#059669',
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300/70 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-600 dark:bg-emerald-400',
  },
  {
    id: 'teal',
    name: 'Nordic Teal',
    hex: '#0d9488',
    bgClass: 'bg-teal-500/15 dark:bg-teal-500/20',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-300/70 dark:border-teal-500/30',
    dotClass: 'bg-teal-600 dark:bg-teal-400',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    hex: '#d97706',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/20',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-300/70 dark:border-amber-500/30',
    dotClass: 'bg-amber-600 dark:bg-amber-400',
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    hex: '#ea580c',
    bgClass: 'bg-orange-500/15 dark:bg-orange-500/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-300/70 dark:border-orange-500/30',
    dotClass: 'bg-orange-600 dark:bg-orange-400',
  },
  {
    id: 'rose',
    name: 'Ruby Rose',
    hex: '#e11d48',
    bgClass: 'bg-rose-500/15 dark:bg-rose-500/20',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-300/70 dark:border-rose-500/30',
    dotClass: 'bg-rose-600 dark:bg-rose-400',
  },
  {
    id: 'pink',
    name: 'Berry Pink',
    hex: '#db2777',
    bgClass: 'bg-pink-500/15 dark:bg-pink-500/20',
    textClass: 'text-pink-700 dark:text-pink-300',
    borderClass: 'border-pink-300/70 dark:border-pink-500/30',
    dotClass: 'bg-pink-600 dark:bg-pink-400',
  },
  {
    id: 'sky',
    name: 'Clear Sky',
    hex: '#0284c7',
    bgClass: 'bg-sky-500/15 dark:bg-sky-500/20',
    textClass: 'text-sky-700 dark:text-sky-300',
    borderClass: 'border-sky-300/70 dark:border-sky-500/30',
    dotClass: 'bg-sky-600 dark:bg-sky-400',
  },
  {
    id: 'slate',
    name: 'Cool Slate',
    hex: '#475569',
    bgClass: 'bg-slate-500/15 dark:bg-slate-500/20',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-300/70 dark:border-slate-500/30',
    dotClass: 'bg-slate-600 dark:bg-slate-400',
  },
  {
    id: 'lime',
    name: 'Fresh Lime',
    hex: '#65a30d',
    bgClass: 'bg-lime-500/15 dark:bg-lime-500/20',
    textClass: 'text-lime-700 dark:text-lime-300',
    borderClass: 'border-lime-300/70 dark:border-lime-500/30',
    dotClass: 'bg-lime-600 dark:bg-lime-400',
  }
];

export const DEFAULT_TASK_TAGS: TaskTag[] = [
  // Projects
  { id: 'proj-finance', name: 'Finance', color: '#059669', type: 'project', description: 'Budgeting & financial records' },
  { id: 'proj-design', name: 'Design', color: '#4f46e5', type: 'project', description: 'UI/UX & design prototypes' },
  { id: 'proj-eng', name: 'Engineering', color: '#0284c7', type: 'project', description: 'Codebases & tech infrastructure' },
  { id: 'proj-personal', name: 'Personal', color: '#db2777', type: 'project', description: 'Personal affairs & errands' },
  { id: 'proj-health', name: 'Health', color: '#10b981', type: 'project', description: 'Fitness, running & wellness' },
  
  // Contexts
  { id: 'ctx-work', name: '@Work', color: '#2563eb', type: 'context', description: 'Office, work desk & meetings' },
  { id: 'ctx-home', name: '@Home', color: '#0d9488', type: 'context', description: 'Household & domestic tasks' },
  { id: 'ctx-errands', name: '@Errands', color: '#ea580c', type: 'context', description: 'Stores, outdoors & travel' },
  { id: 'ctx-desk', name: '@Desk', color: '#475569', type: 'context', description: 'Deep computer focus time' },
  { id: 'ctx-calls', name: '@Calls', color: '#e11d48', type: 'context', description: 'Phone calls & follow-ups' },

  // General Labels
  { id: 'lbl-urgent', name: 'Urgent', color: '#dc2626', type: 'label', description: 'High-priority time sensitive' },
  { id: 'lbl-reminder', name: 'Reminder', color: '#d97706', type: 'label', description: 'Follow-ups & reminders' },
];

export interface TagStyle {
  bg: string;
  text: string;
  border: string;
  dot: string;
  colorHex: string;
  hex?: string;
  styleObj?: React.CSSProperties;
  dotStyleObj?: React.CSSProperties;
}

const CUSTOM_TAGS_STORAGE_KEY = 'modulardeck_task_tags_v2';

export function loadSavedTags(): TaskTag[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_STORAGE_KEY);
    if (!raw) return DEFAULT_TASK_TAGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_TASK_TAGS;
  } catch {
    return DEFAULT_TASK_TAGS;
  }
}

export function saveTags(tags: TaskTag[]) {
  try {
    localStorage.setItem(CUSTOM_TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save tags', err);
  }
}

/**
 * Returns complete styling for any tag name or tag object
 */
export function getTagStyle(
  tagInput: string | TaskTag,
  customTagList?: TaskTag[],
  colorOverride?: string
): TagStyle {
  const tagName = typeof tagInput === 'string' ? tagInput : tagInput.name;
  const cleanName = tagName.replace(/^[#@]/, '').trim();
  const lowerName = cleanName.toLowerCase();

  // 1. Check if direct colorOverride is provided
  if (colorOverride) {
    return createStyleFromHex(colorOverride);
  }

  // 2. Check if passed tagInput is an object with color
  if (typeof tagInput === 'object' && tagInput.color) {
    return createStyleFromHex(tagInput.color);
  }

  // 3. Check custom tag list or saved tags
  const list = customTagList || loadSavedTags();
  const matched = list.find(t => 
    t.name.toLowerCase() === lowerName || 
    t.name.replace(/^[#@]/, '').toLowerCase() === lowerName
  );

  if (matched?.color) {
    return createStyleFromHex(matched.color);
  }

  // 4. Check preset matches based on name keywords
  if (lowerName.includes('work')) return createStyleFromHex('#2563eb');
  if (lowerName.includes('finance') || lowerName.includes('budget') || lowerName.includes('money')) return createStyleFromHex('#059669');
  if (lowerName.includes('design') || lowerName.includes('art')) return createStyleFromHex('#4f46e5');
  if (lowerName.includes('urgent') || lowerName.includes('critical')) return createStyleFromHex('#dc2626');
  if (lowerName.includes('reminder')) return createStyleFromHex('#d97706');
  if (lowerName.includes('personal')) return createStyleFromHex('#db2777');
  if (lowerName.includes('health') || lowerName.includes('fit')) return createStyleFromHex('#10b981');
  if (lowerName.includes('home')) return createStyleFromHex('#0d9488');
  if (lowerName.includes('errand')) return createStyleFromHex('#ea580c');
  if (lowerName.includes('call')) return createStyleFromHex('#e11d48');

  // 5. Deterministic color generation based on string hash
  let hash = 0;
  for (let i = 0; i < lowerName.length; i++) {
    hash = lowerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const presetIndex = Math.abs(hash) % TAG_COLOR_PRESETS.length;
  const preset = TAG_COLOR_PRESETS[presetIndex];
  
  return {
    bg: preset.bgClass,
    text: preset.textClass,
    border: preset.borderClass,
    dot: preset.dotClass,
    colorHex: preset.hex,
    hex: preset.hex,
  };
}

function createStyleFromHex(hex: string): TagStyle {
  // Check if hex matches a known preset
  const matchedPreset = TAG_COLOR_PRESETS.find(p => p.hex.toLowerCase() === hex.toLowerCase());
  if (matchedPreset) {
    return {
      bg: matchedPreset.bgClass,
      text: matchedPreset.textClass,
      border: matchedPreset.borderClass,
      dot: matchedPreset.dotClass,
      colorHex: matchedPreset.hex,
      hex: matchedPreset.hex,
    };
  }

  // Custom hex color support with dynamic styles
  return {
    bg: '',
    text: '',
    border: '',
    dot: '',
    colorHex: hex,
    hex,
    styleObj: {
      backgroundColor: `${hex}18`,
      borderColor: `${hex}40`,
      color: hex,
    },
    dotStyleObj: {
      backgroundColor: hex,
    },
  };
}
