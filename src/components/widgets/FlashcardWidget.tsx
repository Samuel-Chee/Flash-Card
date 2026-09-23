import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus, DatabaseColumn, TaskTag, TagType } from '../../types';
import { playSound } from '../../utils/audio';
import { 
  getTagStyle, 
  loadSavedTags, 
  saveTags, 
  TAG_COLOR_PRESETS, 
  DEFAULT_TASK_TAGS 
} from '../../utils/tagColors';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  Tag as TagIcon, 
  Filter, 
  Edit2, 
  Check, 
  X, 
  PlusCircle, 
  ChevronRight,
  ChevronDown,
  Palette, 
  Type, 
  Bold, 
  Underline, 
  Strikethrough, 
  SlidersHorizontal,
  Search,
  Sparkles,
  RotateCcw,
  Info,
  Italic,
  Layers,
  Folder,
  AtSign,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardWidgetProps {
  tasks: Task[];
  title?: string;
  onRenameTitle?: (newTitle: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onDragStartTask?: (e: React.DragEvent, taskId: string) => void;
}

const RECOMMENDED_TAGS = ['Work', 'Reminder'];

const INITIAL_COLUMNS: DatabaseColumn[] = [
  { id: 'uncomplete', title: 'Uncompleted', statusMatch: 'todo', color: 'sky' },
  { id: 'in_progress', title: 'In Progress', statusMatch: 'in_progress', color: 'amber' },
  { id: 'complete', title: 'Complete', statusMatch: 'completed', color: 'emerald' },
];

export const TEXT_COLOR_PALETTE = [
  { label: 'Default Black', value: '', hex: '#0a0a0a', category: 'Neutrals' },
  { label: 'Slate Charcoal', value: '#334155', hex: '#334155', category: 'Neutrals' },
  { label: 'Muted Slate', value: '#64748b', hex: '#64748b', category: 'Neutrals' },
  { label: 'Cool Silver', value: '#94a3b8', hex: '#94a3b8', category: 'Neutrals' },
  { label: 'Warm Espresso', value: '#573a27', hex: '#573a27', category: 'Neutrals' },
  { label: 'Pure White', value: '#ffffff', hex: '#ffffff', category: 'Neutrals' },

  { label: 'Royal Blue', value: '#2563eb', hex: '#2563eb', category: 'Vibrant' },
  { label: 'Electric Indigo', value: '#4f46e5', hex: '#4f46e5', category: 'Vibrant' },
  { label: 'Sky Cerulean', value: '#0284c7', hex: '#0284c7', category: 'Vibrant' },
  { label: 'Teal Cyan', value: '#0891b2', hex: '#0891b2', category: 'Vibrant' },
  { label: 'Aqua Marine', value: '#0d9488', hex: '#0d9488', category: 'Vibrant' },
  { label: 'Emerald Green', value: '#059669', hex: '#059669', category: 'Vibrant' },
  { label: 'Jade Meadow', value: '#10b981', hex: '#10b981', category: 'Vibrant' },
  { label: 'Lime Meadow', value: '#65a30d', hex: '#65a30d', category: 'Vibrant' },

  { label: 'Golden Amber', value: '#d97706', hex: '#d97706', category: 'Warm' },
  { label: 'Sunburst Gold', value: '#ca8a04', hex: '#ca8a04', category: 'Warm' },
  { label: 'Tangerine Orange', value: '#ea580c', hex: '#ea580c', category: 'Warm' },
  { label: 'Coral Peach', value: '#f97316', hex: '#f97316', category: 'Warm' },
  { label: 'Ruby Red', value: '#dc2626', hex: '#dc2626', category: 'Warm' },
  { label: 'Rose Crimson', value: '#e11d48', hex: '#e11d48', category: 'Warm' },

  { label: 'Vivid Purple', value: '#7c3aed', hex: '#7c3aed', category: 'Purples' },
  { label: 'Electric Violet', value: '#8b5cf6', hex: '#8b5cf6', category: 'Purples' },
  { label: 'Deep Fuchsia', value: '#c026d3', hex: '#c026d3', category: 'Purples' },
  { label: 'Hot Magenta', value: '#db2777', hex: '#db2777', category: 'Purples' },
  { label: 'Soft Lavender', value: '#9333ea', hex: '#9333ea', category: 'Purples' },
  { label: 'Pastel Berry', value: '#be185d', hex: '#be185d', category: 'Purples' },
];

export const COLOR_SPECTRUM_CHART = [
  '#000000', '#1f2937', '#4b5563', '#9ca3af', '#e5e7eb', '#ffffff',
  '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#ea580c', '#f97316',
  '#fb923c', '#fdba74', '#d97706', '#f59e0b', '#fbbf24', '#fde68a',
  '#16a34a', '#22c55e', '#4ade80', '#86efac', '#059669', '#10b981',
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#2563eb', '#3b82f6',
  '#4f46e5', '#6366f1', '#818cf8', '#7c3aed', '#8b5cf6', '#a855f7',
  '#c026d3', '#d946ef', '#e879f9', '#db2777', '#ec4899', '#f472b6',
];

export const BG_COLOR_PALETTE = [
  { label: 'Clean Glass', value: '', hex: '#ffffff', bgClass: 'bg-white/55 dark:bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-190 border-white/85 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.15)]' },
  { label: 'Pure Snow', value: 'snow', hex: '#ffffff', bgClass: 'bg-white/90 dark:bg-neutral-800/90 backdrop-blur-2xl backdrop-saturate-190 border-neutral-200/90 dark:border-neutral-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)]' },
  { label: 'Soft Slate', value: 'slate', hex: '#f8fafc', bgClass: 'bg-slate-200/45 dark:bg-slate-800/35 backdrop-blur-2xl backdrop-saturate-190 border-slate-300/60 dark:border-slate-700/40 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Minimal Dark', value: 'dark', hex: '#171717', bgClass: 'bg-neutral-900/75 text-white dark:bg-black/75 backdrop-blur-2xl backdrop-saturate-190 border-white/25 dark:border-white/12 shadow-[0_6px_25px_rgba(0,0,0,0.25),inset_0_1.5px_1.5px_rgba(255,255,255,0.25)]' },
  { label: 'Deep Navy Glass', value: 'navy', hex: '#0f172a', bgClass: 'bg-slate-900/75 text-white dark:bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-190 border-sky-400/30 dark:border-sky-500/20 shadow-[0_6px_25px_rgba(15,23,42,0.35),inset_0_1.5px_1.5px_rgba(255,255,255,0.2)]' },

  { label: 'Pastel Sky', value: 'sky', hex: '#e0f2fe', bgClass: 'bg-sky-500/20 dark:bg-sky-500/25 backdrop-blur-2xl backdrop-saturate-200 border-sky-300/60 dark:border-sky-400/30 shadow-[0_4px_20px_rgba(14,165,233,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Indigo', value: 'indigo', hex: '#e0e7ff', bgClass: 'bg-indigo-500/20 dark:bg-indigo-500/25 backdrop-blur-2xl backdrop-saturate-200 border-indigo-300/60 dark:border-indigo-400/30 shadow-[0_4px_20px_rgba(99,102,241,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Purple', value: 'purple', hex: '#f3e8ff', bgClass: 'bg-purple-500/20 dark:bg-purple-500/25 backdrop-blur-2xl backdrop-saturate-200 border-purple-300/60 dark:border-purple-400/30 shadow-[0_4px_20px_rgba(168,85,247,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Rose', value: 'rose', hex: '#ffe4e6', bgClass: 'bg-rose-500/20 dark:bg-rose-500/25 backdrop-blur-2xl backdrop-saturate-200 border-rose-300/60 dark:border-rose-400/30 shadow-[0_4px_20px_rgba(244,63,94,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Amber', value: 'amber', hex: '#fef3c7', bgClass: 'bg-amber-500/20 dark:bg-amber-500/25 backdrop-blur-2xl backdrop-saturate-200 border-amber-300/60 dark:border-amber-400/30 shadow-[0_4px_20px_rgba(245,158,11,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Emerald', value: 'emerald', hex: '#d1fae5', bgClass: 'bg-emerald-500/20 dark:bg-emerald-500/25 backdrop-blur-2xl backdrop-saturate-200 border-emerald-300/60 dark:border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Mint', value: 'mint', hex: '#ccfbf1', bgClass: 'bg-teal-500/20 dark:bg-teal-500/25 backdrop-blur-2xl backdrop-saturate-200 border-teal-300/60 dark:border-teal-400/30 shadow-[0_4px_20px_rgba(20,184,166,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Lime', value: 'lime', hex: '#ecfccb', bgClass: 'bg-lime-500/20 dark:bg-lime-500/25 backdrop-blur-2xl backdrop-saturate-200 border-lime-300/60 dark:border-lime-400/30 shadow-[0_4px_20px_rgba(132,204,22,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Peach', value: 'peach', hex: '#ffedd5', bgClass: 'bg-orange-500/20 dark:bg-orange-500/25 backdrop-blur-2xl backdrop-saturate-200 border-orange-300/60 dark:border-orange-400/30 shadow-[0_4px_20px_rgba(249,115,22,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Pink', value: 'pink', hex: '#fce7f3', bgClass: 'bg-pink-500/20 dark:bg-pink-500/25 backdrop-blur-2xl backdrop-saturate-200 border-pink-300/60 dark:border-pink-400/30 shadow-[0_4px_20px_rgba(236,72,153,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },
  { label: 'Pastel Sand', value: 'sand', hex: '#f5f5f4', bgClass: 'bg-stone-300/40 dark:bg-stone-800/40 backdrop-blur-2xl backdrop-saturate-200 border-stone-300/60 dark:border-stone-700/40 shadow-[0_4px_20px_rgba(120,113,108,0.08),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)]' },

  { label: 'Sunburst Glow', value: 'glow-yellow', hex: '#fef08a', bgClass: 'bg-yellow-400/25 dark:bg-yellow-400/30 backdrop-blur-2xl backdrop-saturate-200 border-yellow-300/70 dark:border-yellow-400/40 shadow-[0_4px_20px_rgba(234,179,8,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
  { label: 'Cyber Cyan', value: 'glow-cyan', hex: '#a5f3fc', bgClass: 'bg-cyan-400/25 dark:bg-cyan-400/30 backdrop-blur-2xl backdrop-saturate-200 border-cyan-300/70 dark:border-cyan-400/40 shadow-[0_4px_20px_rgba(6,182,212,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
  { label: 'Neon Mint', value: 'glow-mint', hex: '#a7f3d0', bgClass: 'bg-emerald-400/25 dark:bg-emerald-400/30 backdrop-blur-2xl backdrop-saturate-200 border-emerald-300/70 dark:border-emerald-400/40 shadow-[0_4px_20px_rgba(16,185,129,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
  { label: 'Electric Lilac', value: 'glow-purple', hex: '#ddd6fe', bgClass: 'bg-violet-400/25 dark:bg-violet-400/30 backdrop-blur-2xl backdrop-saturate-200 border-violet-300/70 dark:border-violet-400/40 shadow-[0_4px_20px_rgba(139,92,246,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
  { label: 'Sunset Coral', value: 'glow-orange', hex: '#fed7aa', bgClass: 'bg-orange-400/25 dark:bg-orange-400/30 backdrop-blur-2xl backdrop-saturate-200 border-orange-300/70 dark:border-orange-400/40 shadow-[0_4px_20px_rgba(249,115,22,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
  { label: 'Candy Blossom', value: 'glow-pink', hex: '#fbcfe8', bgClass: 'bg-pink-400/25 dark:bg-pink-400/30 backdrop-blur-2xl backdrop-saturate-200 border-pink-300/70 dark:border-pink-400/40 shadow-[0_4px_20px_rgba(236,72,153,0.12),inset_0_1.5px_1.5px_rgba(255,255,255,0.9)]' },
];

export interface FontStyleOption {
  id: string;
  name: string;
  category: string;
  preview: string;
  className: string;
  fontFamily: string;
}

export const FONT_STYLE_PALETTE: FontStyleOption[] = [
  {
    id: 'sans',
    name: 'Modern Sans',
    category: 'System / Clean',
    preview: 'Aa Clean Sans',
    className: 'font-sans',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  {
    id: 'serif',
    name: 'Classic Serif',
    category: 'Editorial / Elegant',
    preview: 'Aa Classic Serif',
    className: 'font-serif',
    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
  },
  {
    id: 'mono',
    name: 'Code Mono',
    category: 'Technical / Terminal',
    preview: 'Aa Code Mono',
    className: 'font-mono',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  },
  {
    id: 'rounded',
    name: 'Soft Rounded',
    category: 'Friendly & Casual',
    preview: 'Aa Rounded Soft',
    className: 'tracking-wide font-medium',
    fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, -apple-system, sans-serif'
  },
  {
    id: 'handwriting',
    name: 'Handwritten',
    category: 'Casual Note',
    preview: 'Aa Note Script',
    className: 'italic tracking-tight',
    fontFamily: '"Caveat", "Comic Sans MS", "Segoe Print", cursive'
  },
  {
    id: 'display',
    name: 'Bold Display',
    category: 'Geometric Impact',
    preview: 'Aa Heavy Impact',
    className: 'font-black tracking-tight',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'editorial',
    name: 'Didot Editorial',
    category: 'Luxury / High Fashion',
    preview: 'Aa High Fashion',
    className: 'font-serif tracking-widest',
    fontFamily: '"Didot", "Bodoni MT", "Cinzel", "Garamond", serif'
  },
  {
    id: 'typewriter',
    name: 'Vintage Typewriter',
    category: 'Mechanical / Retro',
    preview: 'Aa 1970s Typewriter',
    className: 'font-mono tracking-tight',
    fontFamily: '"Courier New", Courier, monospace'
  },
  {
    id: 'grotesque',
    name: 'Neo Grotesque',
    category: 'Swiss Minimalist',
    preview: 'Aa Swiss Neutral',
    className: 'font-semibold tracking-wide',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
  },
  {
    id: 'condensed',
    name: 'Tall Condensed',
    category: 'Headline / Poster',
    preview: 'Aa TALL COMPACT',
    className: 'tracking-tighter font-extrabold',
    fontFamily: '"Impact", "Arial Narrow", sans-serif-condensed, sans-serif'
  },
  {
    id: 'playful',
    name: 'Playful Comic',
    category: 'Cartoon / Joyful',
    preview: 'Aa Bouncy Bubble',
    className: 'font-bold',
    fontFamily: '"Comic Neue", "Chalkboard", "Comic Sans MS", cursive'
  },
  {
    id: 'antique',
    name: 'Antique Literary',
    category: 'Classic Novelist',
    preview: 'Aa Fine Literature',
    className: 'font-serif',
    fontFamily: '"Palatino", "Palatino Linotype", "Book Antiqua", serif'
  },
  {
    id: 'futuristic',
    name: 'Tech Geometric',
    category: 'Cyber / Sci-Fi',
    preview: 'Aa CYBER MATRIX',
    className: 'tracking-wider font-bold uppercase',
    fontFamily: '"Trebuchet MS", "Lucida Sans", system-ui, sans-serif'
  },
  {
    id: 'brush',
    name: 'Brush Calligraphy',
    category: 'Artistic Ink',
    preview: 'Aa Smooth Flourish',
    className: 'italic',
    fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive'
  },
  {
    id: 'slab',
    name: 'Slab Serif',
    category: 'Architect / Bold',
    preview: 'Aa Strong Slab',
    className: 'font-bold',
    fontFamily: '"Rockwell", "Courier Bold", serif'
  },
  {
    id: 'minimal',
    name: 'Ultra Light',
    category: 'Clean Architecture',
    preview: 'Aa Pure Air',
    className: 'font-light tracking-wide',
    fontFamily: '"Avenir Next", "Segoe UI Light", sans-serif'
  },
];

export interface FontSizeOption {
  id: string;
  name: string;
  label: string;
  titleClass: string;
  descClass: string;
  badge: string;
  sampleSize: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'xs', name: 'XS', label: 'Compact', titleClass: 'text-[11px] leading-tight', descClass: 'text-[10px]', badge: '11px', sampleSize: 'Aa Compact' },
  { id: 'sm', name: 'S', label: 'Small', titleClass: 'text-xs leading-snug', descClass: 'text-[11px]', badge: '12px', sampleSize: 'Aa Small' },
  { id: 'base', name: 'M', label: 'Standard', titleClass: 'text-sm leading-snug', descClass: 'text-xs', badge: '14px', sampleSize: 'Aa Standard' },
  { id: 'lg', name: 'L', label: 'Large', titleClass: 'text-base leading-snug', descClass: 'text-xs', badge: '16px', sampleSize: 'Aa Large' },
  { id: 'xl', name: 'XL', label: 'Extra Large', titleClass: 'text-lg leading-snug font-extrabold', descClass: 'text-sm', badge: '18px', sampleSize: 'Aa Extra' },
  { id: '2xl', name: '2XL', label: 'Huge', titleClass: 'text-xl leading-snug font-extrabold', descClass: 'text-sm', badge: '20px', sampleSize: 'Aa Huge' },
];

export const FlashcardWidget: React.FC<FlashcardWidgetProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDragStartTask,
}) => {
  // =========================================================================
  // State: Popovers & Modals (Main Controls: Add Card, Filter, Group, Customize)
  // =========================================================================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

  // Grouping state: 'status' | 'project' | 'context' | 'tag'
  const [groupBy, setGroupBy] = useState<'status' | 'project' | 'context' | 'tag'>('status');

  // Customize menu state
  const [activeCustomizeTab, setActiveCustomizeTab] = useState<'color' | 'font' | 'size' | 'tags' | 'format'>('color');
  const [activeColorSubmenu, setActiveColorSubmenu] = useState<'words' | 'background'>('words');
  const [colorMode, setColorMode] = useState<'palette' | 'chart'>('palette');

  // Tag Management State
  const [customTags, setCustomTags] = useState<TaskTag[]>(() => loadSavedTags());
  const [tagCategoryFilter, setTagCategoryFilter] = useState<'all' | 'project' | 'context' | 'label'>('all');
  const [newTagName, setNewTagName] = useState('');
  const [newTagType, setNewTagType] = useState<TagType>('project');
  const [newTagColor, setNewTagColor] = useState('#2563eb');
  const [colorPickerForTagId, setColorPickerForTagId] = useState<string | null>(null);

  // Filter criteria states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'no_date' | string>('all');

  // Selected Card & Global Formatting State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTextColor, setActiveTextColor] = useState<string>('');
  const [activeBgColor, setActiveBgColor] = useState<string>('');
  const [activeIsBold, setActiveIsBold] = useState<boolean>(false);
  const [activeIsItalic, setActiveIsItalic] = useState<boolean>(false);
  const [activeIsUnderline, setActiveIsUnderline] = useState<boolean>(false);
  const [activeIsStrikethrough, setActiveIsStrikethrough] = useState<boolean>(false);
  const [activeFontStyle, setActiveFontStyle] = useState<string>('sans');
  const [activeFontSize, setActiveFontSize] = useState<string>('sm');

  // Refs for click outside
  const filterRef = useRef<HTMLDivElement>(null);
  const customizeRef = useRef<HTMLDivElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // Date Helpers: DD-MM-YYYY format and auto-formatting
  // =========================================================================
  const formatDateToDDMMYYYY = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatDateToYYYYMMDD = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  const parseAnyDateStringToDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr || !dateStr.trim()) return null;
    const clean = dateStr.trim();

    // 1. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1], 10);
      const m = parseInt(dmyMatch[2], 10) - 1;
      const y = parseInt(dmyMatch[3], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime()) && date.getDate() === d && date.getMonth() === m) {
        return date;
      }
    }

    // 2. YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10) - 1;
      const d = parseInt(ymdMatch[3], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime()) && date.getDate() === d && date.getMonth() === m) {
        return date;
      }
    }

    // 3. 8 continuous digits: DDMMYYYY
    if (/^\d{8}$/.test(clean)) {
      const d = parseInt(clean.slice(0, 2), 10);
      const m = parseInt(clean.slice(2, 4), 10) - 1;
      const y = parseInt(clean.slice(4, 8), 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime()) && date.getDate() === d && date.getMonth() === m) {
        return date;
      }
    }

    const fallback = new Date(clean);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const normalizeToDDMMYYYY = (val: string): string => {
    if (!val || !val.trim()) return '';
    const parsed = parseAnyDateStringToDate(val.trim());
    if (parsed) {
      return formatDateToDDMMYYYY(parsed);
    }
    return val.trim();
  };

  const autoFormatDateInput = (val: string, prevVal: string): string => {
    // If user is deleting (backspacing), allow deleting without inserting hyphens
    if (val.length < prevVal.length) {
      return val;
    }

    // Normalize separators (/ . space) to hyphens
    let clean = val.replace(/[/.\s]/g, '-');
    clean = clean.replace(/[^0-9-]/g, '');

    // Case 1: user keys in digits without hyphens (e.g. 22092026)
    if (!clean.includes('-')) {
      const digits = clean;
      if (digits.length <= 2) {
        return digits;
      } else if (digits.length <= 4) {
        return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else {
        return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
      }
    }

    // Case 2: hyphens present
    const parts = clean.split('-');
    if (parts.length === 1 && parts[0].length === 2) {
      return `${parts[0]}-`;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      clean = `${parts[0]}-${parts[1].slice(0, 2)}-${parts[1].slice(2, 6)}`;
    }

    return clean.slice(0, 10);
  };

  const getDatePreviewLabel = (dateStr: string) => {
    if (!dateStr || !dateStr.trim()) return 'No due date set';
    const parsed = parseAnyDateStringToDate(dateStr);
    if (!parsed) return dateStr;

    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);

    const isToday = parsed.getDate() === today.getDate() &&
                    parsed.getMonth() === today.getMonth() &&
                    parsed.getFullYear() === today.getFullYear();

    const isTomorrow = parsed.getDate() === tomorrow.getDate() &&
                       parsed.getMonth() === tomorrow.getMonth() &&
                       parsed.getFullYear() === tomorrow.getFullYear();

    const dmy = formatDateToDDMMYYYY(parsed);

    if (isToday) {
      return `Today (${dmy})`;
    }
    if (isTomorrow) {
      return `Tomorrow (${dmy})`;
    }

    const weekday = parsed.toLocaleDateString(undefined, { weekday: 'short' });
    return `${weekday}, ${dmy}`;
  };

  // Selected Task reference
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // =========================================================================
  // State: Add Card Modal Form Fields
  // =========================================================================
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalTags, setModalTags] = useState<string[]>([]);
  const [modalProject, setModalProject] = useState<string>('');
  const [modalContext, setModalContext] = useState<string>('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [modalDate, setModalDate] = useState<string>(() => formatDateToDDMMYYYY(new Date()));
  const [modalColumnId, setModalColumnId] = useState<string>('uncomplete');
  const [modalTextColor, setModalTextColor] = useState<string>('');
  const [modalBgColor, setModalBgColor] = useState<string>('');
  const [modalIsBold, setModalIsBold] = useState<boolean>(false);
  const [modalIsUnderline, setModalIsUnderline] = useState<boolean>(false);
  const [modalIsStrikethrough, setModalIsStrikethrough] = useState<boolean>(false);
  const [sortByDate, setSortByDate] = useState<'none' | 'asc' | 'desc'>('none');

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) {
        setIsFilterOpen(false);
      }
      if (customizeRef.current && !customizeRef.current.contains(target)) {
        setIsCustomizeOpen(false);
      }
      if (groupMenuRef.current && !groupMenuRef.current.contains(target)) {
        setIsGroupMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tag Management Handlers
  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;
    const cleanName = newTagName.trim();
    const newTag: TaskTag = {
      id: `tag-${Date.now()}`,
      name: newTagType === 'context' && !cleanName.startsWith('@') ? `@${cleanName}` : cleanName,
      color: newTagColor || '#2563eb',
      type: newTagType,
    };

    setCustomTags(prev => {
      const next = [...prev.filter(t => t.name.toLowerCase() !== newTag.name.toLowerCase()), newTag];
      saveTags(next);
      return next;
    });

    setNewTagName('');
    playSound.tap();
  };

  const handleDeleteTag = (tagId: string) => {
    setCustomTags(prev => {
      const next = prev.filter(t => t.id !== tagId);
      saveTags(next);
      return next;
    });
    playSound.tap();
  };

  const handleUpdateTagColor = (tagId: string, newColor: string) => {
    setCustomTags(prev => {
      const next = prev.map(t => t.id === tagId ? { ...t, color: newColor } : t);
      saveTags(next);
      return next;
    });
    setColorPickerForTagId(null);
    playSound.tap();
  };

  const handleUpdateTagType = (tagId: string, newType: TagType) => {
    setCustomTags(prev => {
      const next = prev.map(t => t.id === tagId ? { ...t, type: newType } : t);
      saveTags(next);
      return next;
    });
    playSound.tap();
  };

  const handleToggleTaskTag = (taskId: string, tagName: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    const currentTags = targetTask.tags || [];
    const isPresent = currentTags.includes(tagName);
    const updatedTags = isPresent 
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];

    onUpdateTask(taskId, { tags: updatedTags });
    playSound.tap();
  };

  // Database Columns state (editable & expandable)
  const [columns, setColumns] = useState<DatabaseColumn[]>(() => {
    try {
      const saved = localStorage.getItem('modulardeck_todolist_cols');
      return saved ? JSON.parse(saved) : INITIAL_COLUMNS;
    } catch {
      return INITIAL_COLUMNS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('modulardeck_todolist_cols', JSON.stringify(columns));
    } catch {
      // Ignore
    }
  }, [columns]);

  // Column renaming & adding state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Inline card editing (renaming card title directly)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Inline insert card on hover
  const [insertAfterCardId, setInsertAfterCardId] = useState<string | null>(null);
  const [insertColumnId, setInsertColumnId] = useState<string | null>(null);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  // Drag over target column
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Extract all available tags across tasks + custom registered tags
  const availableTags = Array.from(
    new Set([
      ...RECOMMENDED_TAGS, 
      ...customTags.map(t => t.name),
      ...tasks.flatMap(t => t.tags || []),
      ...tasks.map(t => t.project).filter(Boolean) as string[],
      ...tasks.map(t => t.context).filter(Boolean) as string[]
    ])
  ).filter(Boolean);

  // =========================================================================
  // Filtering Logic (Keyword Search + Tags Filter + Date Filter)
  // =========================================================================
  const filteredTasks = tasks.filter(task => {
    // 1. Keyword search (case-insensitive across title, tags, project, context, description)
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some(t => t.toLowerCase().includes(q));
      const matchProject = task.project?.toLowerCase().includes(q);
      const matchContext = task.context?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTag && !matchProject && !matchContext) return false;
    }

    // 2. Tags filter (matches tag, project, or context)
    if (selectedTags.length > 0) {
      const hasMatch = selectedTags.some(sel => {
        const selClean = sel.replace(/^[#@]/, '').toLowerCase();
        const tagMatch = task.tags?.some(t => t.replace(/^[#@]/, '').toLowerCase() === selClean);
        const projMatch = task.project && task.project.replace(/^[#@]/, '').toLowerCase() === selClean;
        const ctxMatch = task.context && task.context.replace(/^[#@]/, '').toLowerCase() === selClean;
        return tagMatch || projMatch || ctxMatch;
      });
      if (!hasMatch) return false;
    }

    // 3. Date filter
    if (selectedDateFilter !== 'all') {
      const today = new Date();
      const tomorrow = new Date(Date.now() + 86400000);
      const taskDate = parseAnyDateStringToDate(task.dueDate);

      if (selectedDateFilter === 'today') {
        if (!taskDate) return false;
        const isToday = taskDate.getDate() === today.getDate() &&
                        taskDate.getMonth() === today.getMonth() &&
                        taskDate.getFullYear() === today.getFullYear();
        if (!isToday) return false;
      } else if (selectedDateFilter === 'tomorrow') {
        if (!taskDate) return false;
        const isTomorrow = taskDate.getDate() === tomorrow.getDate() &&
                           taskDate.getMonth() === tomorrow.getMonth() &&
                           taskDate.getFullYear() === tomorrow.getFullYear();
        if (!isTomorrow) return false;
      } else if (selectedDateFilter === 'this_week') {
        if (!taskDate) return false;
        const diffDays = (taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (diffDays < -1 || diffDays > 7) return false;
      } else if (selectedDateFilter === 'no_date') {
        if (task.dueDate) return false;
      } else {
        // Specific custom date string
        if (!taskDate) return false;
        const filterDate = parseAnyDateStringToDate(selectedDateFilter);
        if (filterDate) {
          if (formatDateToDDMMYYYY(taskDate) !== formatDateToDDMMYYYY(filterDate)) return false;
        } else if (task.dueDate !== selectedDateFilter) {
          return false;
        }
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortByDate === 'none') return 0;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const timeA = parseAnyDateStringToDate(a.dueDate)?.getTime() ?? 0;
    const timeB = parseAnyDateStringToDate(b.dueDate)?.getTime() ?? 0;
    return sortByDate === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const hasActiveFilters = Boolean(
    searchKeyword.trim() || 
    selectedTags.length > 0 || 
    selectedDateFilter !== 'all'
  );

  const clearAllFilters = () => {
    playSound.tap();
    setSearchKeyword('');
    setSelectedTags([]);
    setSelectedDateFilter('all');
  };

  // =========================================================================
  // Formatting Actions (Applies to selected task or default active styles)
  // =========================================================================
  const handleToggleBold = () => {
    playSound.tap();
    if (selectedTaskId) {
      const current = selectedTask?.isBold ?? false;
      onUpdateTask(selectedTaskId, { isBold: !current });
    } else {
      setActiveIsBold(prev => !prev);
    }
  };

  const handleToggleItalic = () => {
    playSound.tap();
    if (selectedTaskId) {
      const current = selectedTask?.isItalic ?? false;
      onUpdateTask(selectedTaskId, { isItalic: !current });
    } else {
      setActiveIsItalic(prev => !prev);
    }
  };

  const handleToggleUnderline = () => {
    playSound.tap();
    if (selectedTaskId) {
      const current = selectedTask?.isUnderline ?? false;
      onUpdateTask(selectedTaskId, { isUnderline: !current });
    } else {
      setActiveIsUnderline(prev => !prev);
    }
  };

  const handleToggleStrikethrough = () => {
    playSound.tap();
    if (selectedTaskId) {
      const current = selectedTask?.isStrikethrough ?? false;
      onUpdateTask(selectedTaskId, { isStrikethrough: !current });
    } else {
      setActiveIsStrikethrough(prev => !prev);
    }
  };

  const handleApplyFontStyle = (fontId: string) => {
    playSound.tap();
    setActiveFontStyle(fontId);
    if (selectedTaskId) {
      onUpdateTask(selectedTaskId, { fontStyle: fontId });
    } else {
      tasks.forEach(t => {
        onUpdateTask(t.id, { fontStyle: fontId });
      });
    }
  };

  const handleApplyFontSize = (sizeId: string) => {
    playSound.tap();
    setActiveFontSize(sizeId);
    if (selectedTaskId) {
      onUpdateTask(selectedTaskId, { fontSize: sizeId });
    } else {
      tasks.forEach(t => {
        onUpdateTask(t.id, { fontSize: sizeId });
      });
    }
  };

  const handleApplyTextColor = (colorHex: string) => {
    playSound.tap();
    if (selectedTaskId) {
      onUpdateTask(selectedTaskId, { textColor: colorHex || undefined });
    } else {
      setActiveTextColor(colorHex);
    }
  };

  const handleApplyBgColor = (bgValue: string) => {
    playSound.tap();
    if (selectedTaskId) {
      onUpdateTask(selectedTaskId, { bgColor: bgValue || undefined });
    } else {
      setActiveBgColor(bgValue);
    }
  };

  const handleResetCardStyles = () => {
    playSound.tap();
    if (selectedTaskId) {
      onUpdateTask(selectedTaskId, {
        textColor: undefined,
        bgColor: undefined,
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrikethrough: false,
        fontStyle: undefined,
        fontSize: undefined,
      });
    } else {
      tasks.forEach(t => {
        onUpdateTask(t.id, {
          textColor: undefined,
          bgColor: undefined,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrikethrough: false,
          fontStyle: undefined,
          fontSize: undefined,
        });
      });
    }
    setActiveTextColor('');
    setActiveBgColor('');
    setActiveIsBold(false);
    setActiveIsItalic(false);
    setActiveIsUnderline(false);
    setActiveIsStrikethrough(false);
    setActiveFontStyle('sans');
    setActiveFontSize('sm');
  };

  // Status toggle
  const toggleStatus = (task: Task) => {
    const nextStatus: TaskStatus = 
      task.status === 'todo' ? 'in_progress' :
      task.status === 'in_progress' ? 'completed' : 'todo';

    if (nextStatus === 'completed') {
      playSound.taskComplete();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      playSound.tap();
    }

    onUpdateTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      columnId: nextStatus === 'completed' ? 'complete' : nextStatus === 'in_progress' ? 'in_progress' : 'uncomplete',
    });
  };

  const formatDueDisplay = (dateStr: string | null) => {
    if (!dateStr) return null;
    const parsed = parseAnyDateStringToDate(dateStr);
    if (!parsed) return dateStr;

    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);

    const isToday = parsed.getDate() === today.getDate() &&
                    parsed.getMonth() === today.getMonth() &&
                    parsed.getFullYear() === today.getFullYear();

    const isTomorrow = parsed.getDate() === tomorrow.getDate() &&
                       parsed.getMonth() === tomorrow.getMonth() &&
                       parsed.getFullYear() === tomorrow.getFullYear();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return formatDateToDDMMYYYY(parsed);
  };

  // =========================================================================
  // Dynamic Grouping Columns
  // =========================================================================
  const activeColumns: DatabaseColumn[] = useMemo(() => {
    if (groupBy === 'status') {
      return columns;
    }

    if (groupBy === 'project') {
      const projectMap = new Map<string, string>();
      customTags.filter(t => t.type === 'project').forEach(t => projectMap.set(t.name, t.color));
      tasks.forEach(t => {
        if (t.project && !projectMap.has(t.project)) {
          projectMap.set(t.project, '#4f46e5');
        }
      });

      const cols: DatabaseColumn[] = Array.from(projectMap.entries()).map(([name, color]) => ({
        id: `proj:${name}`,
        title: name,
        color: color,
      }));

      cols.push({
        id: 'proj:__none__',
        title: 'No Project',
        color: '#94a3b8',
      });
      return cols;
    }

    if (groupBy === 'context') {
      const contextMap = new Map<string, string>();
      customTags.filter(t => t.type === 'context').forEach(t => contextMap.set(t.name, t.color));
      tasks.forEach(t => {
        if (t.context && !contextMap.has(t.context)) {
          contextMap.set(t.context, '#0d9488');
        }
      });

      const cols: DatabaseColumn[] = Array.from(contextMap.entries()).map(([name, color]) => ({
        id: `ctx:${name}`,
        title: name,
        color: color,
      }));

      cols.push({
        id: 'ctx:__none__',
        title: 'No Context',
        color: '#94a3b8',
      });
      return cols;
    }

    if (groupBy === 'tag') {
      const tagMap = new Map<string, string>();
      customTags.forEach(t => tagMap.set(t.name, t.color));
      tasks.forEach(t => {
        t.tags?.forEach(tag => {
          if (!tagMap.has(tag)) tagMap.set(tag, '#3b82f6');
        });
      });

      const cols: DatabaseColumn[] = Array.from(tagMap.entries()).map(([name, color]) => ({
        id: `tag:${name}`,
        title: name,
        color: color,
      }));

      cols.push({
        id: 'tag:__none__',
        title: 'Untagged',
        color: '#94a3b8',
      });
      return cols;
    }

    return columns;
  }, [groupBy, columns, customTags, tasks]);

  // =========================================================================
  // Drag and Drop & Column Operations
  // =========================================================================
  const getTasksForColumn = (column: DatabaseColumn) => {
    return filteredTasks.filter(t => {
      if (groupBy === 'status') {
        if (t.columnId) return t.columnId === column.id;
        if (column.statusMatch) return t.status === column.statusMatch;
        return false;
      }
      if (groupBy === 'project') {
        if (column.id === 'proj:__none__') return !t.project || !t.project.trim();
        return t.project?.toLowerCase() === column.title.toLowerCase();
      }
      if (groupBy === 'context') {
        if (column.id === 'ctx:__none__') return !t.context || !t.context.trim();
        const tCtxClean = t.context?.replace(/^@/, '').toLowerCase();
        const colClean = column.title.replace(/^@/, '').toLowerCase();
        return tCtxClean === colClean;
      }
      if (groupBy === 'tag') {
        if (column.id === 'tag:__none__') return !t.tags || t.tags.length === 0;
        return t.tags?.includes(column.title);
      }
      return false;
    });
  };

  const handleColumnDrop = (e: React.DragEvent, column: DatabaseColumn) => {
    e.preventDefault();
    setDragOverColId(null);

    try {
      const raw = e.dataTransfer.getData('text/plain');
      const data = JSON.parse(raw);
      if (data && data.type === 'TASK' && data.taskId) {
        if (groupBy === 'status') {
          const nextStatus: TaskStatus = 
            column.statusMatch || 
            (column.id === 'complete' ? 'completed' : column.id === 'in_progress' ? 'in_progress' : 'todo');

          if (nextStatus === 'completed') {
            playSound.taskComplete();
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.7 }
            });
          } else {
            playSound.cardDrop();
          }

          onUpdateTask(data.taskId, {
            status: nextStatus,
            columnId: column.id,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          });
        } else if (groupBy === 'project') {
          playSound.cardDrop();
          const newProj = column.id === 'proj:__none__' ? undefined : column.title;
          const task = tasks.find(t => t.id === data.taskId);
          const nextTags = task?.tags ? [...task.tags] : [];
          if (newProj && !nextTags.includes(newProj)) {
            nextTags.push(newProj);
          }
          onUpdateTask(data.taskId, {
            project: newProj,
            tags: nextTags,
          });
        } else if (groupBy === 'context') {
          playSound.cardDrop();
          const newCtx = column.id === 'ctx:__none__' ? undefined : column.title;
          const task = tasks.find(t => t.id === data.taskId);
          const nextTags = task?.tags ? [...task.tags] : [];
          if (newCtx && !nextTags.includes(newCtx)) {
            nextTags.push(newCtx);
          }
          onUpdateTask(data.taskId, {
            context: newCtx,
            tags: nextTags,
          });
        } else if (groupBy === 'tag') {
          playSound.cardDrop();
          if (column.id !== 'tag:__none__') {
            const task = tasks.find(t => t.id === data.taskId);
            if (task && !task.tags?.includes(column.title)) {
              onUpdateTask(data.taskId, {
                tags: [...(task.tags || []), column.title],
              });
            }
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleInlineInsertCard = (column: DatabaseColumn) => {
    if (!inlineTaskTitle.trim()) {
      setInsertAfterCardId(null);
      setInsertColumnId(null);
      return;
    }

    const nextStatus: TaskStatus = 
      groupBy === 'status'
        ? (column.statusMatch || 'todo')
        : 'todo';

    const newProject = groupBy === 'project' && column.id !== 'proj:__none__' ? column.title : undefined;
    const newContext = groupBy === 'context' && column.id !== 'ctx:__none__' ? column.title : undefined;
    const inlineTags = [
      ...(newProject ? [newProject] : []),
      ...(newContext ? [newContext] : []),
      ...(groupBy === 'tag' && column.id !== 'tag:__none__' ? [column.title] : [])
    ];

    onAddTask({
      title: inlineTaskTitle.trim(),
      status: nextStatus,
      priority: 'medium',
      tags: inlineTags.length > 0 ? inlineTags : (selectedTags.length > 0 ? [selectedTags[0]] : ['Work']),
      project: newProject,
      context: newContext,
      dueDate: formatDateToDDMMYYYY(new Date()),
      columnId: column.id,
      textColor: undefined,
      bgColor: undefined,
      isBold: false,
      isUnderline: false,
      isStrikethrough: false,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
    });

    playSound.cardDrop();
    setInlineTaskTitle('');
    setInsertAfterCardId(null);
    setInsertColumnId(null);
  };

  // Open Add Card modal in pristine original color and form
  const handleOpenAddModal = () => {
    playSound.tap();
    setSelectedTaskId(null); // Deselect any existing task so new card starts completely fresh
    setModalTitle('');
    setModalDescription('');
    setModalTags([]);
    setModalProject(groupBy === 'project' && modalColumnId.startsWith('proj:') && modalColumnId !== 'proj:__none__' ? modalColumnId.replace('proj:', '') : '');
    setModalContext(groupBy === 'context' && modalColumnId.startsWith('ctx:') && modalColumnId !== 'ctx:__none__' ? modalColumnId.replace('ctx:', '') : '');
    setCustomTagInput('');
    setModalDate(formatDateToDDMMYYYY(new Date()));
    setModalColumnId(columns[0]?.id || 'uncomplete');
    // Clean original form
    setModalTextColor('');
    setModalBgColor('');
    setModalIsBold(false);
    setModalIsUnderline(false);
    setModalIsStrikethrough(false);
    setIsAddModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const targetCol = columns.find(c => c.id === modalColumnId) || columns[0] || INITIAL_COLUMNS[0];
    const initialStatus: TaskStatus = targetCol.statusMatch || 'todo';
    const finalDueDate = modalDate.trim() ? normalizeToDDMMYYYY(modalDate.trim()) : null;

    const finalProj = modalProject.trim() || undefined;
    const finalCtx = modalContext.trim() || undefined;
    const finalTags = Array.from(new Set([
      ...modalTags,
      ...(finalProj ? [finalProj] : []),
      ...(finalCtx ? [finalCtx] : []),
    ])).filter(Boolean);

    onAddTask({
      title: modalTitle.trim(),
      description: modalDescription.trim() || undefined,
      status: initialStatus,
      priority: 'medium', // Priority level removed from user flow as requested
      tags: finalTags,
      project: finalProj,
      context: finalCtx,
      dueDate: finalDueDate,
      columnId: targetCol.id,
      textColor: undefined,
      bgColor: undefined,
      isBold: false,
      isUnderline: false,
      isStrikethrough: false,
    });

    playSound.cardDrop();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });

    // Reset all modal fields back to original pristine form
    setModalTitle('');
    setModalDescription('');
    setModalTags([]);
    setModalProject('');
    setModalContext('');
    setCustomTagInput('');
    setModalDate(formatDateToDDMMYYYY(new Date()));
    setModalTextColor('');
    setModalBgColor('');
    setModalIsBold(false);
    setModalIsUnderline(false);
    setModalIsStrikethrough(false);
    setIsAddModalOpen(false);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (trimmed && !modalTags.includes(trimmed)) {
      setModalTags(prev => [...prev, trimmed]);
      setCustomTagInput('');
      playSound.tap();
    }
  };

  const toggleModalTag = (tag: string) => {
    playSound.tap();
    setModalTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveColumnRename = (columnId: string) => {
    if (!editingColumnTitle.trim()) {
      setEditingColumnId(null);
      return;
    }
    playSound.tap();
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title: editingColumnTitle.trim() } : c));
    setEditingColumnId(null);
  };

  const handleAddNewColumn = () => {
    if (!newColumnName.trim()) {
      setIsAddingColumn(false);
      return;
    }
    playSound.tap();
    const colId = `col-${Date.now()}`;
    setColumns(prev => [
      ...prev,
      {
        id: colId,
        title: newColumnName.trim(),
        color: 'violet',
      }
    ]);
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const handleSaveTaskTitle = (taskId: string) => {
    if (editingTaskTitle.trim()) {
      onUpdateTask(taskId, { title: editingTaskTitle.trim() });
      playSound.tap();
    }
    setEditingTaskId(null);
  };

  const getCardBgClass = (bgValue?: string) => {
    if (!bgValue) {
      return 'bg-white/55 dark:bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-190 border-white/85 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.15)]';
    }
    const found = BG_COLOR_PALETTE.find(b => b.value === bgValue);
    return found ? found.bgClass : 'bg-white/55 dark:bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-190 border-white/85 dark:border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.15)]';
  };

  return (
    <div id="todo-list-database-container" className="flex flex-col h-full select-none relative">
      {/* ========================================================================= */}
      {/* TOP HEADER: STRICTLY 3 MAIN BUTTONS (Add Card, Filter, Customize)        */}
      {/* ========================================================================= */}
      <div className={`flex flex-col gap-2.5 mb-3.5 pb-3 border-b border-black/[0.04] dark:border-white/[0.06] relative ${isFilterOpen || isCustomizeOpen ? 'z-50' : 'z-20'}`}>
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          {/* LEFT: 3 Main Buttons in an iOS Glass Segmented Container */}
          <div className={`ios-glass-pill p-1.5 rounded-2xl flex items-center flex-wrap gap-1.5 relative ${isFilterOpen || isCustomizeOpen ? 'z-50' : 'z-20'}`}>
            {/* 1. MAIN BUTTON: + Add Card (iOS Liquid Glass Action Button) */}
            <button
              id="btn-add-card"
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-2xl active:scale-95 bg-neutral-900/85 hover:bg-neutral-900 text-white border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.4)] dark:bg-white/85 dark:hover:bg-white dark:text-neutral-900 dark:border-white/40 dark:shadow-[0_4px_16px_rgba(255,255,255,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.95)] relative z-10"
              title="Add a new card in larger screen"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Card</span>
            </button>

            {/* 2. MAIN BUTTON: Filter (iOS Frosted Glass Pill) */}
            <div className={`relative ${isFilterOpen ? 'z-50' : 'z-20'}`} ref={filterRef}>
              <button
                id="btn-filter"
                type="button"
                onClick={() => {
                  playSound.tap();
                  setIsFilterOpen(prev => !prev);
                  setIsCustomizeOpen(false);
                  setIsGroupMenuOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer backdrop-blur-2xl active:scale-95 relative z-10 border ${
                  hasActiveFilters || isFilterOpen
                    ? 'bg-white/90 dark:bg-white/30 text-neutral-900 dark:text-white border-white/80 dark:border-white/25 shadow-[0_4px_18px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)]'
                    : 'bg-white/45 hover:bg-white/75 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 border-white/70 dark:border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.85)]'
                }`}
                title="Filter tasks by keywords, tags, or date"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs">
                    {selectedTags.length + (searchKeyword ? 1 : 0) + (selectedDateFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* FILTER POPOVER: Keyword search + recommendations (by tags, by date) */}
              {isFilterOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-88 p-4 bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl border border-white/80 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)] max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5" /> Filter Cards
                    </span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* 1. Search Keywords */}
                  <div className="mb-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Search Keywords
                    </label>
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search card title or text..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-neutral-900 dark:text-white outline-hidden focus:border-neutral-900 dark:focus:border-white"
                      />
                      {searchKeyword && (
                        <button
                          type="button"
                          onClick={() => setSearchKeyword('')}
                          className="absolute right-2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Filter by Projects */}
                  {customTags.filter(t => t.type === 'project').length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Folder className="w-3 h-3" /> Projects
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {customTags.filter(t => t.type === 'project').map(proj => {
                          const count = tasks.filter(t => t.project?.toLowerCase() === proj.name.toLowerCase() || t.tags?.includes(proj.name)).length;
                          const isSelected = selectedTags.includes(proj.name);
                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => {
                                playSound.tap();
                                setSelectedTags(prev => 
                                  prev.includes(proj.name) ? prev.filter(t => t !== proj.name) : [...prev, proj.name]
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold'
                                  : 'bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:opacity-85'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                              <span>{proj.name}</span>
                              <span className="text-[9px] opacity-75 font-mono">({count})</span>
                              {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Filter by Contexts */}
                  {customTags.filter(t => t.type === 'context').length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <AtSign className="w-3 h-3" /> Contexts
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {customTags.filter(t => t.type === 'context').map(ctx => {
                          const count = tasks.filter(t => t.context?.replace(/^@/, '').toLowerCase() === ctx.name.replace(/^@/, '').toLowerCase()).length;
                          const isSelected = selectedTags.includes(ctx.name);
                          return (
                            <button
                              key={ctx.id}
                              type="button"
                              onClick={() => {
                                playSound.tap();
                                setSelectedTags(prev => 
                                  prev.includes(ctx.name) ? prev.filter(t => t !== ctx.name) : [...prev, ctx.name]
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold'
                                  : 'bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:opacity-85'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ctx.color }} />
                              <span>{ctx.name}</span>
                              <span className="text-[9px] opacity-75 font-mono">({count})</span>
                              {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Recommendations: Filter by Tags */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <TagIcon className="w-3 h-3" /> Tags
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
                      {availableTags.map(tag => {
                        const count = tasks.filter(t => t.tags?.includes(tag) || t.project === tag || t.context === tag).length;
                        const isSelected = selectedTags.includes(tag);
                        const style = getTagStyle(tag, customTags);

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              setSelectedTags(prev => 
                                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold'
                                : `${style.bg} ${style.text} ${style.border} hover:opacity-80`
                            }`}
                            style={!isSelected ? style.styleObj : undefined}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} style={style.dotStyleObj} />
                            <span>#{tag}</span>
                            <span className="text-[9px] opacity-75 font-mono">({count})</span>
                            {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Recommendations: Filter by Date */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Recommended: Filter by Date
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      {[
                        { label: 'All Dates', value: 'all' },
                        { label: 'Today', value: 'today' },
                        { label: 'Tomorrow', value: 'tomorrow' },
                        { label: 'This Week', value: 'this_week' },
                        { label: 'No Date', value: 'no_date' },
                      ].map(item => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            playSound.tap();
                            setSelectedDateFilter(item.value);
                          }}
                          className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                            selectedDateFilter === item.value
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Sort Cards by Date */}
                  <div className="mb-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Auto Sort Cards by Date
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-[11px]">
                      {[
                        { label: 'Default', value: 'none' },
                        { label: 'Earliest First', value: 'asc' },
                        { label: 'Latest First', value: 'desc' },
                      ].map(item => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            playSound.tap();
                            setSortByDate(item.value as any);
                          }}
                          className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                            sortByDate === item.value
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Popover Footer */}
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Found {filteredTasks.length} of {tasks.length} cards</span>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold hover:bg-black cursor-pointer shadow-2xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. MAIN BUTTON: Group By (iOS Frosted Glass Pill) */}
            <div className={`relative ${isGroupMenuOpen ? 'z-50' : 'z-20'}`} ref={groupMenuRef}>
              <button
                id="btn-group-by"
                type="button"
                onClick={() => {
                  playSound.tap();
                  setIsGroupMenuOpen(prev => !prev);
                  setIsFilterOpen(false);
                  setIsCustomizeOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer backdrop-blur-2xl active:scale-95 relative z-10 border ${
                  groupBy !== 'status' || isGroupMenuOpen
                    ? 'bg-white/90 dark:bg-white/30 text-neutral-900 dark:text-white border-white/80 dark:border-white/25 shadow-[0_4px_18px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)]'
                    : 'bg-white/45 hover:bg-white/75 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 border-white/70 dark:border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.85)]'
                }`}
                title="Group cards by Status, Project, Context, or Tags"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Group: {groupBy === 'status' ? 'Status' : groupBy === 'project' ? 'Project' : groupBy === 'context' ? 'Context' : 'Tags'}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* GROUP BY POPOVER */}
              {isGroupMenuOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-60 p-2.5 bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl border border-white/80 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)] animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Group Cards By
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { id: 'status', label: 'Status Columns', desc: 'Default workflow (Uncompleted, In Progress, Complete)', icon: '📊' },
                      { id: 'project', label: 'Project Columns', desc: 'Group cards by their project tag', icon: '📁' },
                      { id: 'context', label: 'Context Columns', desc: 'Group by context (@Work, @Home, @Errands)', icon: '📍' },
                      { id: 'tag', label: 'Tag Columns', desc: 'Group cards by all registered tags', icon: '🏷️' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          playSound.tap();
                          setGroupBy(item.id as any);
                          setIsGroupMenuOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                          groupBy === item.id
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold shadow-sm'
                            : 'hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className={`text-[10.5px] leading-tight ${groupBy === item.id ? 'opacity-85' : 'text-neutral-400'}`}>
                            {item.desc}
                          </div>
                        </div>
                        {groupBy === item.id && <Check className="w-3.5 h-3.5 mt-1 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. MAIN BUTTON: Customize (iOS Frosted Glass Pill) */}
            <div className={`relative ${isCustomizeOpen ? 'z-50' : 'z-20'}`} ref={customizeRef}>
              <button
                id="btn-customize"
                type="button"
                onClick={() => {
                  playSound.tap();
                  setIsCustomizeOpen(prev => !prev);
                  setIsFilterOpen(false);
                  setIsGroupMenuOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer backdrop-blur-2xl active:scale-95 relative z-10 border ${
                  isCustomizeOpen || activeTextColor || activeBgColor || activeIsBold || activeIsItalic || activeIsUnderline || activeIsStrikethrough || activeFontStyle !== 'sans' || activeFontSize !== 'sm'
                    ? 'bg-white/90 dark:bg-white/30 text-neutral-900 dark:text-white border-white/80 dark:border-white/25 shadow-[0_4px_18px_rgba(0,0,0,0.08),inset_0_1px_1.5px_rgba(255,255,255,1)]'
                    : 'bg-white/45 hover:bg-white/75 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-200 border-white/70 dark:border-white/15 shadow-[0_2px_10px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.85)]'
                }`}
                title="Customize fonts, colors, text sizes & formatting"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize</span>
                {/* Visual indicator dot if styling active */}
                {(activeTextColor || activeBgColor || activeIsBold || activeIsItalic || activeIsUnderline || activeIsStrikethrough || activeFontStyle !== 'sans' || activeFontSize !== 'sm') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-2xs" />
                )}
              </button>

              {/* CUSTOMIZE POPOVER: Colors, Color Chart, Font Styles, Text Sizes & Formatting */}
              {isCustomizeOpen && (
                <div 
                  className="absolute left-0 top-full mt-2 z-50 w-84 sm:w-[440px] bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl border border-white/80 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)] p-3.5 sm:p-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95"
                >
                  {/* Selected card notice */}
                  <div className="px-3 py-2 mb-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.05] dark:border-white/10 flex items-center justify-between text-xs backdrop-blur-md">
                    {selectedTask ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-bold text-neutral-900 dark:text-neutral-100 max-w-[240px]">
                          Styling: "{selectedTask.title}"
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(null)}
                          className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer ml-2 font-semibold"
                        >
                          Deselect
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Styling defaults (or tap any card below to style it)</span>
                      </div>
                    )}
                  </div>

                  {/* 5 MAIN CATEGORY TABS: Color | Font | Size | Tags | Format */}
                  <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-black/[0.05] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.08] mb-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setActiveCustomizeTab('color');
                      }}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCustomizeTab === 'color'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-bold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Colors</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setActiveCustomizeTab('font');
                      }}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCustomizeTab === 'font'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-bold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Fonts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setActiveCustomizeTab('size');
                      }}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCustomizeTab === 'size'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-bold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">Aa</span>
                      <span>Size</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setActiveCustomizeTab('tags');
                      }}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCustomizeTab === 'tags'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-bold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                      <span>Tags</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setActiveCustomizeTab('format');
                      }}
                      className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeCustomizeTab === 'format'
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-bold'
                          : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                      <span>Format</span>
                    </button>
                  </div>

                  {/* ========================================================================= */}
                  {/* TAB 1: COLORS (Words vs Background, Palette vs Chart)                      */}
                  {/* ========================================================================= */}
                  {activeCustomizeTab === 'color' && (
                    <div className="mb-3.5 animate-in fade-in">
                      {/* Segmented Switcher for Words (Text) vs Card Background */}
                      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.08] mb-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            playSound.tap();
                            setActiveColorSubmenu('words');
                          }}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeColorSubmenu === 'words'
                              ? 'bg-white text-neutral-900 dark:bg-white/20 dark:text-white shadow-xs font-bold border border-black/5 dark:border-white/10'
                              : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <Type className="w-3.5 h-3.5" />
                          <span>Words (Text)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playSound.tap();
                            setActiveColorSubmenu('background');
                          }}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeColorSubmenu === 'background'
                              ? 'bg-white text-neutral-900 dark:bg-white/20 dark:text-white shadow-xs font-bold border border-black/5 dark:border-white/10'
                              : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>Card Background</span>
                        </button>
                      </div>

                      {/* Mode Toggle: Curated Palette vs Spectrum Color Chart */}
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                          {activeColorSubmenu === 'words' ? 'Word Color Mode' : 'Background Surface Mode'}
                        </span>
                        <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/5 p-0.5 rounded-lg border border-black/5 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              setColorMode('palette');
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                              colorMode === 'palette'
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            Palette
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              setColorMode('chart');
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                              colorMode === 'chart'
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            Color Chart
                          </button>
                        </div>
                      </div>

                      {/* SUBPANEL 1: WORDS / TEXT COLORS */}
                      {activeColorSubmenu === 'words' && (
                        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                          {/* 1A: Curated Color Palette */}
                          {colorMode === 'palette' && (
                            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                              {['Neutrals', 'Vibrant', 'Warm', 'Purples'].map(cat => {
                                const catColors = TEXT_COLOR_PALETTE.filter(c => c.category === cat);
                                return (
                                  <div key={cat}>
                                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                      {cat}
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                      {catColors.map(item => {
                                        const isSelected = (selectedTask?.textColor || activeTextColor) === item.value;
                                        return (
                                          <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleApplyTextColor(item.value)}
                                            className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                              isSelected
                                                ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-400/40 bg-white dark:bg-white/10 shadow-xs font-bold'
                                                : 'border-transparent bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                                            }`}
                                            title={`${item.label} (${item.hex})`}
                                          >
                                            <span
                                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs flex items-center justify-center text-white shrink-0"
                                              style={{ backgroundColor: item.hex }}
                                            >
                                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </span>
                                            <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                              {item.label.replace('Default ', '')}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 1B: Spectrum Color Chart (42 Swatches Grid) */}
                          {colorMode === 'chart' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                <span>Interactive Spectrum Chart</span>
                                <span className="text-[10px] font-mono">42 shades</span>
                              </div>
                              <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.04] dark:border-white/10">
                                {COLOR_SPECTRUM_CHART.map((hex, idx) => {
                                  const isSelected = (selectedTask?.textColor || activeTextColor)?.toLowerCase() === hex.toLowerCase();
                                  return (
                                    <button
                                      key={`${hex}-${idx}`}
                                      type="button"
                                      onClick={() => handleApplyTextColor(hex)}
                                      className={`w-full aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center relative hover:scale-110 active:scale-95 ${
                                        isSelected 
                                          ? 'border-white ring-2 ring-neutral-900 dark:ring-white shadow-md z-10 scale-105' 
                                          : 'border-black/10 dark:border-white/20'
                                      }`}
                                      style={{ backgroundColor: hex }}
                                      title={hex}
                                    >
                                      {isSelected && (
                                        <Check className={`w-3 h-3 stroke-[3] ${['#ffffff', '#fde68a', '#e5e7eb', '#fca5a5', '#fdba74', '#86efac', '#67e8f9', '#f472b6', '#fed7aa', '#fbcfe8'].includes(hex) ? 'text-black' : 'text-white'}`} />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Custom Hex Color Code Input for Words */}
                          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2">
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Custom Color:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={selectedTask?.textColor || activeTextColor || '#0a0a0a'}
                                onChange={(e) => handleApplyTextColor(e.target.value)}
                                className="w-6 h-6 rounded-md border border-neutral-300 dark:border-neutral-600 cursor-pointer p-0"
                                title="Pick custom color"
                              />
                              <input
                                type="text"
                                placeholder="#0a0a0a"
                                value={selectedTask?.textColor || activeTextColor || ''}
                                onChange={(e) => handleApplyTextColor(e.target.value)}
                                className="w-20 text-[11px] font-mono px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden"
                              />
                              {(selectedTask?.textColor || activeTextColor) && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyTextColor('')}
                                  className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer px-1 py-0.5"
                                  title="Reset to default text color"
                                >
                                  Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBPANEL 2: CARD BACKGROUND SURFACES */}
                      {activeColorSubmenu === 'background' && (
                        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                          {/* 2A: Curated Surface Palette */}
                          {colorMode === 'palette' && (
                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2.5">
                              <div>
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                  Glass & Minimalist (5)
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                  {BG_COLOR_PALETTE.slice(0, 5).map(item => {
                                    const isSelected = (selectedTask?.bgColor || activeBgColor) === item.value;
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => handleApplyBgColor(item.value)}
                                        className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                          isSelected
                                            ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-400/40 bg-white dark:bg-white/10 shadow-xs font-bold'
                                            : 'border-transparent bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                                        }`}
                                        title={`${item.label} (${item.hex})`}
                                      >
                                        <span
                                          className="w-4 h-4 rounded-md border border-black/10 dark:border-white/20 shadow-2xs flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: item.hex }}
                                        >
                                          {isSelected && <Check className="w-2.5 h-2.5 text-neutral-900 dark:text-neutral-100 stroke-[3]" />}
                                        </span>
                                        <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                          {item.label.replace('Soft ', '').replace('Pastel ', '')}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                  Pastel Shades (11)
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                  {BG_COLOR_PALETTE.slice(5, 16).map(item => {
                                    const isSelected = (selectedTask?.bgColor || activeBgColor) === item.value;
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => handleApplyBgColor(item.value)}
                                        className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                          isSelected
                                            ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-400/40 bg-white dark:bg-white/10 shadow-xs font-bold'
                                            : 'border-transparent bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                                        }`}
                                        title={`${item.label} (${item.hex})`}
                                      >
                                        <span
                                          className="w-4 h-4 rounded-md border border-black/10 dark:border-white/20 shadow-2xs flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: item.hex }}
                                        >
                                          {isSelected && <Check className="w-2.5 h-2.5 text-neutral-900 dark:text-neutral-100 stroke-[3]" />}
                                        </span>
                                        <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                          {item.label.replace('Pastel ', '')}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                                  Glow & Accents (6)
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                  {BG_COLOR_PALETTE.slice(16).map(item => {
                                    const isSelected = (selectedTask?.bgColor || activeBgColor) === item.value;
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => handleApplyBgColor(item.value)}
                                        className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                          isSelected
                                            ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-400/40 bg-white dark:bg-white/10 shadow-xs font-bold'
                                            : 'border-transparent bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10'
                                        }`}
                                        title={`${item.label} (${item.hex})`}
                                      >
                                        <span
                                          className="w-4 h-4 rounded-md border border-black/10 dark:border-white/20 shadow-2xs flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: item.hex }}
                                        >
                                          {isSelected && <Check className="w-2.5 h-2.5 text-neutral-900 dark:text-neutral-100 stroke-[3]" />}
                                        </span>
                                        <span className="text-[10px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                          {item.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2B: Color Chart for Card Background Tinting */}
                          {colorMode === 'chart' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                                <span>Background Tint Chart</span>
                                <span className="text-[10px] font-mono">42 shades</span>
                              </div>
                              <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-black/[0.04] dark:border-white/10">
                                {COLOR_SPECTRUM_CHART.map((hex, idx) => {
                                  const isSelected = (selectedTask?.bgColor || activeBgColor)?.toLowerCase() === hex.toLowerCase();
                                  return (
                                    <button
                                      key={`bg-${hex}-${idx}`}
                                      type="button"
                                      onClick={() => handleApplyBgColor(hex)}
                                      className={`w-full aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center relative hover:scale-110 active:scale-95 ${
                                        isSelected 
                                          ? 'border-white ring-2 ring-neutral-900 dark:ring-white shadow-md z-10 scale-105' 
                                          : 'border-black/10 dark:border-white/20'
                                      }`}
                                      style={{ backgroundColor: hex }}
                                      title={`Tint background with ${hex}`}
                                    >
                                      {isSelected && (
                                        <Check className={`w-3 h-3 stroke-[3] ${['#ffffff', '#fde68a', '#e5e7eb', '#fca5a5', '#fdba74', '#86efac', '#67e8f9', '#f472b6', '#fed7aa', '#fbcfe8'].includes(hex) ? 'text-black' : 'text-white'}`} />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Custom Hex Color Code for Background */}
                          <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2">
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">Custom Color:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={selectedTask?.bgColor || activeBgColor || '#ffffff'}
                                onChange={(e) => handleApplyBgColor(e.target.value)}
                                className="w-6 h-6 rounded-md border border-neutral-300 dark:border-neutral-600 cursor-pointer p-0"
                                title="Pick custom background"
                              />
                              <input
                                type="text"
                                placeholder="#ffffff"
                                value={selectedTask?.bgColor || activeBgColor || ''}
                                onChange={(e) => handleApplyBgColor(e.target.value)}
                                className="w-20 text-[11px] font-mono px-2 py-0.5 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden"
                              />
                              {(selectedTask?.bgColor || activeBgColor) && (
                                <button
                                  type="button"
                                  onClick={() => handleApplyBgColor('')}
                                  className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer px-1 py-0.5"
                                  title="Reset to clean glass background"
                                >
                                  Clean Glass
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 2: FONT STYLES (16 Choices with Live Typography Previews)             */}
                  {/* ========================================================================= */}
                  {activeCustomizeTab === 'font' && (
                    <div className="mb-3.5 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                          Font Styles
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 font-semibold">
                          {FONT_STYLE_PALETTE.find(f => f.id === (selectedTask?.fontStyle || activeFontStyle))?.name || 'Modern Sans'} (16 Styles)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                        {FONT_STYLE_PALETTE.map(font => {
                          const isSelected = (selectedTask?.fontStyle || activeFontStyle) === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => handleApplyFontStyle(font.id)}
                              className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                                isSelected
                                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                                  : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200'
                              }`}
                              style={{ fontFamily: font.fontFamily }}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-[11px] font-bold truncate">
                                  {font.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 shrink-0 ml-1 stroke-[3]" />}
                              </div>
                              <span className={`text-[12px] opacity-90 truncate leading-snug ${font.className}`}>
                                {font.preview}
                              </span>
                              <span className="text-[9px] opacity-60 truncate mt-1 font-sans font-normal">
                                {font.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 3: TEXT SIZES (6 Tiers: XS to 2XL with Live Scaling Preview)          */}
                  {/* ========================================================================= */}
                  {activeCustomizeTab === 'size' && (
                    <div className="mb-3.5 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          Text Size Selection
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 font-bold">
                          {FONT_SIZE_OPTIONS.find(s => s.id === (selectedTask?.fontSize || activeFontSize))?.name || 'S'} · {FONT_SIZE_OPTIONS.find(s => s.id === (selectedTask?.fontSize || activeFontSize))?.badge || '12px'}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                        {FONT_SIZE_OPTIONS.map(sizeOpt => {
                          const isSelected = (selectedTask?.fontSize || activeFontSize) === sizeOpt.id;
                          return (
                            <button
                              key={sizeOpt.id}
                              type="button"
                              onClick={() => handleApplyFontSize(sizeOpt.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer text-left ${
                                isSelected
                                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                                  : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? 'bg-white/20 text-white dark:bg-neutral-900/10 dark:text-neutral-900'
                                    : 'bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200'
                                }`}>
                                  {sizeOpt.name}
                                </span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold">{sizeOpt.label}</span>
                                    <span className="text-[10px] font-mono opacity-60">({sizeOpt.badge})</span>
                                  </div>
                                  <span className={`opacity-80 truncate max-w-[200px] sm:max-w-[240px] ${sizeOpt.titleClass}`}>
                                    Quick brown fox jumps
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 4: FORMATTING (Bold, Italic, Underline, Strikethrough)                 */}
                  {/* ========================================================================= */}
                  {activeCustomizeTab === 'format' && (
                    <div className="mb-3.5 animate-in fade-in">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                        Text Weight & Decoration
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleToggleBold}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            (selectedTask ? selectedTask.isBold : activeIsBold)
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                          title="Bold text"
                        >
                          <Bold className="w-4 h-4" />
                          <span>Bold Text</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleItalic}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            (selectedTask ? selectedTask.isItalic : activeIsItalic)
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                          title="Italic text"
                        >
                          <Italic className="w-4 h-4" />
                          <span>Italic Text</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleUnderline}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            (selectedTask ? selectedTask.isUnderline : activeIsUnderline)
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                          title="Underline text"
                        >
                          <Underline className="w-4 h-4" />
                          <span>Underline</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleToggleStrikethrough}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            (selectedTask ? selectedTask.isStrikethrough : activeIsStrikethrough)
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-2xs'
                              : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                          title="Strikethrough text"
                        >
                          <Strikethrough className="w-4 h-4" />
                          <span>Strikethrough</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 5: TAGS & PROJECTS (Color-coding, project/context management, assignment) */}
                  {/* ========================================================================= */}
                  {activeCustomizeTab === 'tags' && (
                    <div className="mb-3.5 animate-in fade-in">
                      {/* Sub-filter: All | Projects | Contexts | Labels */}
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Tags & Categories
                        </span>
                        <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/5 p-0.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
                          {(['all', 'project', 'context', 'label'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                playSound.tap();
                                setTagCategoryFilter(cat);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                                tagCategoryFilter === cat
                                  ? 'bg-white dark:bg-white/20 text-neutral-900 dark:text-white shadow-2xs'
                                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                              }`}
                            >
                              {cat === 'all' ? 'All' : cat === 'project' ? 'Projects' : cat === 'context' ? 'Contexts' : 'Labels'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Create New Tag / Project / Context row */}
                      <div className="p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] mb-3 flex flex-col gap-2">
                        <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 flex items-center justify-between">
                          <span>Create New Tag / Project</span>
                          <span className="text-[9px] font-normal text-neutral-400">Auto-saved</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <input
                            type="text"
                            placeholder="Tag or Project name..."
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateNewTag();
                            }}
                            className="flex-1 min-w-[130px] text-xs px-2.5 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black/40 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-hidden focus:border-neutral-900 dark:focus:border-white"
                          />

                          {/* Type Select */}
                          <select
                            value={newTagType}
                            onChange={(e) => setNewTagType(e.target.value as TagType)}
                            className="text-xs px-2 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden font-medium cursor-pointer"
                          >
                            <option value="project">📁 Project</option>
                            <option value="context">📍 Context</option>
                            <option value="label">🏷️ Label</option>
                          </select>

                          {/* Color picker circle */}
                          <div className="relative">
                            <input
                              type="color"
                              value={newTagColor}
                              onChange={(e) => setNewTagColor(e.target.value)}
                              className="w-7 h-7 rounded-xl cursor-pointer border border-black/10 dark:border-white/20 bg-transparent p-0 overflow-hidden shrink-0"
                              title="Pick custom color"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleCreateNewTag}
                            disabled={!newTagName.trim()}
                            className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:bg-black dark:hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0 shadow-2xs"
                          >
                            Add
                          </button>
                        </div>

                        {/* Quick Presets for New Tag Color */}
                        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                          <span className="text-[9px] text-neutral-400 font-medium shrink-0 mr-1">Presets:</span>
                          {TAG_COLOR_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setNewTagColor(preset.hex)}
                              className={`w-4 h-4 rounded-full transition-transform cursor-pointer shrink-0 border border-black/10 dark:border-white/20 ${
                                newTagColor === preset.hex ? 'scale-125 ring-2 ring-neutral-900 dark:ring-white ring-offset-1' : 'hover:scale-110'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Tag List */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {customTags
                          .filter(t => tagCategoryFilter === 'all' || t.type === tagCategoryFilter)
                          .map(tag => {
                            const isPickerOpen = colorPickerForTagId === tag.id;
                            const isAssignedToSelected = selectedTask?.tags?.includes(tag.name) || selectedTask?.project === tag.name || selectedTask?.context === tag.name;

                            return (
                              <div
                                key={tag.id}
                                className="p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1.5 transition-all hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  {/* Left: Type icon & Tag Name */}
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextType: TagType = tag.type === 'project' ? 'context' : tag.type === 'context' ? 'label' : 'project';
                                        handleUpdateTagType(tag.id, nextType);
                                      }}
                                      className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer shrink-0"
                                      title={`Type: ${tag.type}. Tap to change.`}
                                    >
                                      {tag.type === 'project' ? <Folder className="w-3.5 h-3.5 text-indigo-500" /> : tag.type === 'context' ? <AtSign className="w-3.5 h-3.5 text-teal-500" /> : <TagIcon className="w-3.5 h-3.5 text-blue-500" />}
                                    </button>

                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                                        style={{ backgroundColor: tag.color }}
                                      />
                                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                        {tag.name}
                                      </span>
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 bg-black/[0.04] dark:bg-white/[0.08] px-1.5 py-0.5 rounded-md">
                                        {tag.type}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right: Color trigger, Selected Task toggle, and Delete */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {/* Color palette trigger */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        playSound.tap();
                                        setColorPickerForTagId(prev => prev === tag.id ? null : tag.id);
                                      }}
                                      className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                                      title="Change tag color"
                                    >
                                      <Palette className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Selected Task quick assignment toggle */}
                                    {selectedTask && (
                                      <button
                                        type="button"
                                        onClick={() => handleToggleTaskTag(selectedTask.id, tag.name)}
                                        className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                                          isAssignedToSelected
                                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                            : 'bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/10'
                                        }`}
                                        title={isAssignedToSelected ? "Remove from selected card" : "Assign to selected card"}
                                      >
                                        {isAssignedToSelected ? "✓ Assigned" : "+ Assign"}
                                      </button>
                                    )}

                                    {/* Delete Tag */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTag(tag.id)}
                                      className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                      title="Delete tag"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Color Picker Drawer if open */}
                                {isPickerOpen && (
                                  <div className="pt-2 mt-1 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col gap-1.5 animate-in fade-in">
                                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                      <span>Select Color:</span>
                                      <input
                                        type="color"
                                        value={tag.color}
                                        onChange={(e) => handleUpdateTagColor(tag.id, e.target.value)}
                                        className="w-5 h-5 rounded-md cursor-pointer border border-black/10 dark:border-white/20 bg-transparent p-0 shrink-0"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {TAG_COLOR_PRESETS.map(preset => (
                                        <button
                                          key={preset.id}
                                          type="button"
                                          onClick={() => handleUpdateTagColor(tag.id, preset.hex)}
                                          className={`w-5 h-5 rounded-full transition-transform cursor-pointer border border-black/10 dark:border-white/20 flex items-center justify-center ${
                                            tag.color === preset.hex ? 'ring-2 ring-neutral-900 dark:ring-white scale-110' : 'hover:scale-110'
                                          }`}
                                          style={{ backgroundColor: preset.hex }}
                                          title={preset.name}
                                        >
                                          {tag.color === preset.hex && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* FOOTER: RESET ALL STYLING */}
                  <div className="pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">Applies immediately</span>
                    <button
                      type="button"
                      onClick={handleResetCardStyles}
                      className="text-[11px] font-medium text-neutral-500 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All Styling</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Active Selection & Task Counter in iOS Glass Pills */}
          <div className="flex items-center gap-2">
            {selectedTask && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/70 dark:border-white/15 text-neutral-900 dark:text-neutral-100 text-xs shadow-2xs">
                <span className="font-semibold truncate max-w-[140px]">
                  "{selectedTask.title}"
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(null)}
                  className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md cursor-pointer"
                  title="Deselect card"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-white/50 dark:bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/70 dark:border-white/15 shadow-2xs">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'card' : 'cards'}
            </div>
          </div>
        </div>

        {/* Filter tags chip display when filter is active */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[11px] text-neutral-400 font-semibold mr-1">Active Filters:</span>
            {searchKeyword && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md text-neutral-900 dark:text-neutral-100 border border-white/70 dark:border-white/15">
                "{searchKeyword}"
                <button type="button" onClick={() => setSearchKeyword('')} className="cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md text-neutral-900 dark:text-neutral-100 border border-white/70 dark:border-white/15"
              >
                #{tag}
                <button 
                  type="button" 
                  onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  className="cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {selectedDateFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-md text-neutral-900 dark:text-neutral-100 border border-white/70 dark:border-white/15">
                Date: {selectedDateFilter}
                <button type="button" onClick={() => setSelectedDateFilter('all')} className="cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] text-rose-500 hover:underline cursor-pointer ml-1 font-semibold"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CLEAN DATABASE TABLE VIEW (Columns & Cards with iOS Glass System Effect)  */}
      {/* ========================================================================= */}
      <div id="todo-database-board" className="flex-1 flex flex-col min-h-[320px] overflow-hidden relative z-0 p-2 sm:p-2.5 rounded-[28px] bg-white/25 dark:bg-white/[0.03] backdrop-blur-2xl backdrop-saturate-190 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.85)] dark:shadow-[0_12px_44px_rgba(0,0,0,0.4),inset_0_1.5px_1.5px_rgba(255,255,255,0.12)]">
        <div 
          className="flex-1 flex gap-3.5 overflow-x-auto pb-2 items-start select-none"
          onWheel={(e) => {
            if (e.deltaY !== 0 && e.deltaX === 0) {
              const target = e.target as HTMLElement;
              const isInsideVerticalScroll = target.closest('.overflow-y-auto');
              if (!isInsideVerticalScroll) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }
          }}
        >
          {activeColumns.map((col) => {
            const colTasks = getTasksForColumn(col);
            const isDragOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColId !== col.id) setDragOverColId(col.id);
                }}
                onDragLeave={() => {
                  setDragOverColId(null);
                }}
                onDrop={(e) => handleColumnDrop(e, col)}
                className={`flex-1 min-w-[250px] max-w-[340px] bg-white/45 dark:bg-[#12141c]/50 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl border transition-all flex flex-col max-h-[460px] shadow-[0_10px_35px_rgba(0,0,0,0.04),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.25)] dark:shadow-[0_14px_44px_rgba(0,0,0,0.5),inset_0_1.5px_1.5px_rgba(255,255,255,0.16),inset_0_-1px_1px_rgba(0,0,0,0.35)] ${
                  isDragOver
                    ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-900/20 dark:ring-white/20'
                    : 'border-white/80 dark:border-white/15'
                }`}
              >
                {/* Column Header: Edit title anywhere (onBlur or Enter) with NO tick button */}
                <div className="p-3 border-b border-black/[0.04] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.03] backdrop-blur-md rounded-t-3xl flex items-center justify-between gap-1">
                  {editingColumnId === col.id && groupBy === 'status' ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={editingColumnTitle}
                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                        onBlur={() => handleSaveColumnRename(col.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveColumnRename(col.id);
                          if (e.key === 'Escape') setEditingColumnId(null);
                        }}
                        className="flex-1 text-xs font-bold px-2.5 py-1 rounded-xl border-2 border-neutral-900 dark:border-white bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-hidden shadow-2xs"
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        if (groupBy === 'status') {
                          setEditingColumnId(col.id);
                          setEditingColumnTitle(col.title);
                        }
                      }}
                      className={`flex items-center gap-1.5 py-1 px-1.5 rounded-xl transition-colors ${
                        groupBy === 'status' ? 'cursor-pointer group/coltitle hover:bg-black/5 dark:hover:bg-white/10' : ''
                      }`}
                      title={groupBy === 'status' ? "Click anywhere to rename column (press enter or tap away to save)" : col.title}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: col.color || (col.id === 'complete' ? '#10b981' : col.id === 'in_progress' ? '#3b82f6' : '#94a3b8')
                        }}
                      />
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover/coltitle:text-black dark:group-hover/coltitle:text-white transition-colors">
                        {col.title}
                      </h4>
                      {groupBy === 'status' && (
                        <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/coltitle:opacity-60 text-neutral-400" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/65 dark:bg-white/10 border border-white/70 dark:border-white/15 backdrop-blur-md text-neutral-700 dark:text-neutral-300 shadow-2xs">
                      {colTasks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playSound.tap();
                        setModalColumnId(col.id);
                        handleOpenAddModal();
                      }}
                      className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 backdrop-blur-md cursor-pointer transition-all active:scale-95 shadow-2xs"
                      title="Add card to this column in large view"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Card Stack */}
                <div className="p-2.5 flex-1 overflow-y-auto flex flex-col gap-2">
                  {colTasks.length === 0 && insertColumnId !== col.id && (
                    <div className="py-8 px-3 text-center border border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
                      <p className="text-xs text-neutral-400 font-medium">No cards in this column</p>
                      <button
                        type="button"
                        onClick={() => {
                          setModalColumnId(col.id);
                          handleOpenAddModal();
                        }}
                        className="mt-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer"
                      >
                        + Add a card
                      </button>
                    </div>
                  )}

                  {colTasks.map((task) => {
                    const isSelected = selectedTaskId === task.id;
                    const bgClass = getCardBgClass(task.bgColor);
                    const currentFont = FONT_STYLE_PALETTE.find(f => f.id === (task.fontStyle || activeFontStyle)) || FONT_STYLE_PALETTE[0];
                    const currentFontSize = FONT_SIZE_OPTIONS.find(s => s.id === (task.fontSize || activeFontSize)) || FONT_SIZE_OPTIONS[1];

                    const titleClasses = [
                      currentFont.className,
                      currentFontSize.titleClass,
                      task.isBold ? 'font-black' : 'font-bold',
                      task.isItalic ? 'italic' : '',
                      task.isUnderline ? 'underline underline-offset-2' : '',
                      (task.isStrikethrough || task.status === 'completed') ? 'line-through opacity-60' : '',
                    ].filter(Boolean).join(' ');

                    const isCustomBg = task.bgColor && (task.bgColor.startsWith('#') || task.bgColor.startsWith('rgb'));

                    return (
                      <div key={task.id} className="group/card relative flex flex-col">
                        {/* Card Item in iOS Liquid Glass */}
                        <div
                          draggable
                          onClick={() => {
                            setSelectedTaskId(prev => prev === task.id ? null : task.id);
                            playSound.tap();
                          }}
                          onDragStart={(e) => {
                            playSound.cardPickup();
                            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'TASK', taskId: task.id }));
                            if (onDragStartTask) onDragStartTask(e, task.id);
                          }}
                          style={{
                            backgroundColor: isCustomBg ? `${task.bgColor}22` : undefined,
                            borderColor: isCustomBg ? `${task.bgColor}55` : undefined,
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing relative overflow-hidden ${bgClass} ${
                            isSelected 
                              ? 'ring-2 ring-neutral-900 dark:ring-white border-neutral-900 dark:border-white scale-[1.01] shadow-[0_8px_25px_rgba(0,0,0,0.08)]' 
                              : 'hover:scale-[1.005]'
                          } ${
                            task.status === 'completed'
                              ? 'border-neutral-300/80 dark:border-neutral-700/80 opacity-75'
                              : ''
                          }`}
                        >
                          {/* Card Header: Checkbox + Editable Title + Delete button */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div className="flex items-start gap-2 flex-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStatus(task);
                                }}
                                className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                                  task.status === 'completed'
                                    ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900'
                                    : 'border-neutral-400/80 dark:border-white/20 bg-white/40 dark:bg-white/5 hover:border-neutral-700'
                                }`}
                              >
                                {task.status === 'completed' && <Check className="w-3 h-3 stroke-[2.5]" />}
                              </button>

                              {/* Editable Title: tap anywhere or enter to save */}
                              {editingTaskId === task.id ? (
                                <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingTaskTitle}
                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveTaskTitle(task.id);
                                      if (e.key === 'Escape') setEditingTaskId(null);
                                    }}
                                    onBlur={() => handleSaveTaskTitle(task.id)}
                                    className="w-full text-xs font-bold px-2 py-0.5 rounded-lg border-2 border-neutral-900 dark:border-white bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white outline-hidden shadow-2xs"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col flex-1">
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTaskId(task.id);
                                      setEditingTaskTitle(task.title);
                                    }}
                                    className={`leading-snug cursor-text hover:text-black dark:hover:text-white transition-colors ${titleClasses}`}
                                    style={{ 
                                      color: task.textColor || undefined,
                                      fontFamily: currentFont.fontFamily
                                    }}
                                    title="Click anywhere to rename card (press Enter or tap away to save)"
                                  >
                                    {task.title}
                                  </span>
                                  {task.description && (
                                    <p 
                                      className={`${currentFontSize.descClass} text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-normal`}
                                      style={{ fontFamily: currentFont.fontFamily }}
                                    >
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Delete Card Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this card?')) {
                                  playSound.tap();
                                  onDeleteTask(task.id);
                                }
                              }}
                              className="opacity-0 group-hover/card:opacity-100 p-1 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-opacity cursor-pointer"
                              title="Delete card"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Card Metadata: Project, Context, Tags & Due Date using Zero-Pill Design */}
                          {((task.tags && task.tags.length > 0) || task.project || task.context || task.dueDate) && (
                            <div className="flex items-center justify-between gap-2 text-[10.5px] mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                              {/* Tags, Project & Context as clean unboxed text with typographic separators and colored dots */}
                              <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 overflow-hidden min-w-0">
                                {task.project && (
                                  <span className="inline-flex items-center gap-1 text-neutral-800 dark:text-neutral-200 font-semibold truncate">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                                      style={{ backgroundColor: getTagStyle(task.project, customTags).hex }}
                                    />
                                    <Folder className="w-2.5 h-2.5 opacity-60 shrink-0" />
                                    <span>{task.project}</span>
                                  </span>
                                )}

                                {task.context && (
                                  <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-medium truncate">
                                    {task.project && <span className="text-neutral-300 dark:text-neutral-600">·</span>}
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                                      style={{ backgroundColor: getTagStyle(task.context, customTags).hex }}
                                    />
                                    <span>{task.context.startsWith('@') ? task.context : `@${task.context}`}</span>
                                  </span>
                                )}

                                {(task.tags || []).filter(t => t !== task.project && t !== task.context).map((t, idx) => {
                                  const style = getTagStyle(t, customTags);
                                  const showLeadingDot = task.project || task.context || idx > 0;
                                  return (
                                    <span key={t} className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-medium truncate">
                                      {showLeadingDot && <span className="text-neutral-300 dark:text-neutral-600">·</span>}
                                      <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                                        style={{ backgroundColor: style.hex }}
                                      />
                                      <span>#{t}</span>
                                    </span>
                                  );
                                })}
                              </div>

                              {task.dueDate && (
                                <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-300 flex items-center gap-1 shrink-0">
                                  <Calendar className="w-2.5 h-2.5 opacity-70" />
                                  <span>{formatDueDisplay(task.dueDate)}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Inline Quick Insert below this card */}
                        <div className="py-0.5 flex items-center justify-center opacity-0 group-hover/card:opacity-100 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              playSound.tap();
                              setInsertColumnId(col.id);
                              setInsertAfterCardId(task.id);
                              setInlineTaskTitle('');
                            }}
                            className="w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100/60 dark:bg-neutral-800/40 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Add card here</span>
                          </button>
                        </div>

                        {/* Inline Insert Card Input Form: Tap away or Enter to commit */}
                        {insertColumnId === col.id && insertAfterCardId === task.id && (
                          <div className="my-1.5 p-2 rounded-xl bg-white dark:bg-neutral-900 border-2 border-neutral-900 dark:border-white shadow-md animate-in fade-in zoom-in-95">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Card title (press Enter or tap away to add)..."
                              value={inlineTaskTitle}
                              onChange={(e) => setInlineTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlineInsertCard(col);
                                if (e.key === 'Escape') {
                                  setInsertAfterCardId(null);
                                  setInsertColumnId(null);
                                }
                              }}
                              onBlur={() => {
                                if (inlineTaskTitle.trim()) {
                                  handleInlineInsertCard(col);
                                } else {
                                  setInsertAfterCardId(null);
                                  setInsertColumnId(null);
                                }
                              }}
                              className={`w-full text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 bg-transparent outline-hidden pb-1 ${
                                activeIsBold ? 'font-black' : 'font-semibold'
                              } ${activeIsUnderline ? 'underline' : ''} ${activeIsStrikethrough ? 'line-through' : ''}`}
                              style={{ color: activeTextColor || undefined }}
                            />
                            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                              <button
                                type="button"
                                onClick={() => {
                                  setInsertAfterCardId(null);
                                  setInsertColumnId(null);
                                }}
                                className="text-[10px] px-2 py-0.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInlineInsertCard(col)}
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer hover:bg-black"
                              >
                                Add Card
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column Bottom Add Button */}
                <div className="p-2 border-t border-black/[0.04] dark:border-white/[0.06] bg-white/20 dark:bg-white/[0.02] backdrop-blur-md rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => {
                      setModalColumnId(col.id);
                      handleOpenAddModal();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/15 border border-white/60 dark:border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Column Button: tap away or Enter to add */}
          <div className="min-w-[190px] max-w-[220px]">
            {isAddingColumn ? (
              <div className="p-3.5 rounded-3xl border border-white/80 dark:border-white/20 bg-white/60 dark:bg-[#12141c]/60 backdrop-blur-3xl shadow-lg">
                <input
                  type="text"
                  autoFocus
                  placeholder="Column name (press Enter or tap away)..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNewColumn();
                    if (e.key === 'Escape') setIsAddingColumn(false);
                  }}
                  onBlur={() => {
                    if (newColumnName.trim()) {
                      handleAddNewColumn();
                    } else {
                      setIsAddingColumn(false);
                    }
                  }}
                  className="w-full text-xs font-bold px-2.5 py-1.5 rounded-xl border border-neutral-900 dark:border-white bg-white/80 dark:bg-neutral-900/80 text-neutral-900 dark:text-white outline-hidden shadow-2xs mb-2"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewColumn}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer hover:bg-black"
                  >
                    Add Column
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playSound.tap();
                  setIsAddingColumn(true);
                }}
                className="w-full py-4 px-3 rounded-3xl border border-dashed border-white/70 dark:border-white/15 bg-white/20 hover:bg-white/40 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] backdrop-blur-2xl text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Column</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD CARD MODAL: HALF OPAQUE + IOS GLASS SYSTEMS (CRISP & VISIBLE)          */}
      {/* FIELDS: TITLE, EVENT DETAILS, OPTIONAL TAGS (WORK/REMINDER), CLEAN DATE    */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/25 dark:bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          {/* HALF OPAQUE + IOS GLASS MODAL SHEET: HIGH VISIBILITY WITH TRANSLUCENT REFRACTION */}
          <div 
            className="w-full max-w-[580px] rounded-3xl bg-white/70 dark:bg-[#12141e]/75 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-7 relative animate-in zoom-in-95 transition-all text-neutral-900 dark:text-neutral-100 flex flex-col justify-between ring-1 ring-white/60 dark:ring-white/10"
            onClick={(e) => e.stopPropagation()}
            style={{ minHeight: '360px' }}
          >
            {/* Modal top header & Column placement selector */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  New Card
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Column:
                  </span>
                  <select
                    value={modalColumnId}
                    onChange={(e) => setModalColumnId(e.target.value)}
                    className="text-xs font-semibold py-1 px-2.5 rounded-xl border border-white/80 dark:border-white/15 bg-white/60 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 outline-hidden cursor-pointer shadow-2xs backdrop-blur-md"
                  >
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer transition-colors ml-1"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4 mt-3.5">
              {/* 1. CARD TITLE */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    <Edit2 className="w-3 h-3 text-neutral-600 dark:text-neutral-300" />
                    <span>Card Title</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                    What needs to be done?
                  </span>
                </div>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Type your card title here..."
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full text-base sm:text-lg font-bold placeholder:font-normal placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-white/80 dark:border-white/15 focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 text-neutral-900 dark:text-white outline-hidden transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
              </div>

              {/* 2. EVENT DETAILS / WHAT NEEDS TO BE DONE */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                    <span>Event Details / Notes</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                    Add in the details of this event
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Add in the details of this event or what needs to be done..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-white/80 dark:border-white/15 focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 text-neutral-900 dark:text-white outline-hidden transition-all resize-none leading-relaxed shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                />
              </div>

              {/* 3. PROJECT & CONTEXT SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PROJECT SELECTION / INPUT */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-indigo-500" />
                      <span>Project</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Optional
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      list="project-presets"
                      placeholder="e.g. Website, Marketing..."
                      value={modalProject}
                      onChange={(e) => setModalProject(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-white/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-hidden focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 transition-all font-medium backdrop-blur-md"
                    />
                    <datalist id="project-presets">
                      {customTags.filter(t => t.type === 'project').map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                  {/* Quick Project suggestions */}
                  {customTags.filter(t => t.type === 'project').length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      {customTags.filter(t => t.type === 'project').map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setModalProject(modalProject === p.name ? '' : p.name)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                            modalProject === p.name
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold'
                              : 'bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-white/80'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* CONTEXT SELECTION / INPUT */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-teal-500" />
                      <span>Context</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Location / Mode
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      list="context-presets"
                      placeholder="e.g. Work, Home, Errands..."
                      value={modalContext}
                      onChange={(e) => setModalContext(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-white/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-hidden focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 transition-all font-medium backdrop-blur-md"
                    />
                    <datalist id="context-presets">
                      {customTags.filter(t => t.type === 'context').map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  {/* Quick Context suggestions */}
                  {customTags.filter(t => t.type === 'context').length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      {customTags.filter(t => t.type === 'context').map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setModalContext(modalContext === c.name ? '' : c.name)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                            modalContext === c.name
                              ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold'
                              : 'bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-white/80'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. HORIZONTAL 2-COLUMN SECTION: ADD TAGS (LEFT) & DATE (RIGHT) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* TAGS SECTION */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <TagIcon className="w-3 h-3 text-neutral-600 dark:text-neutral-300" />
                      <span>Tags</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Optional
                    </span>
                  </div>

                  {/* Input for custom tag */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Custom tag & Enter..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border border-white/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-hidden focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 transition-all font-medium backdrop-blur-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 py-2 rounded-xl bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-800 dark:text-neutral-100 text-xs font-semibold cursor-pointer border border-white/80 dark:border-white/15 transition-colors shrink-0 shadow-2xs backdrop-blur-md"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Active tags or Friendly Reminder banner */}
                  {modalTags.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap max-h-14 overflow-y-auto py-0.5">
                      {modalTags.map(tag => {
                        const style = getTagStyle(tag);
                        return (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border transition-all ${style.bg} ${style.text} ${style.border}`}
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => toggleModalTag(tag)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5"
                              title="Remove tag"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-neutral-500 dark:text-neutral-400 text-[10.5px] leading-tight backdrop-blur-xs">
                      <Info className="w-3.5 h-3.5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                      <span>Reminder: No tags added yet. You can add tags below if you'd like to categorize this card.</span>
                    </div>
                  )}

                  {/* Recommendations: Work & Reminder ONLY */}
                  <div className="flex flex-col gap-1 pt-0.5">
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Recommendations:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['Work', 'Reminder'].map(rec => {
                        const isSelected = modalTags.includes(rec);
                        return (
                          <button
                            key={rec}
                            type="button"
                            onClick={() => toggleModalTag(rec)}
                            className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-medium backdrop-blur-md ${
                              isSelected
                                ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 font-bold shadow-2xs'
                                : 'bg-white/60 dark:bg-white/10 border-white/80 dark:border-white/15 text-neutral-700 dark:text-neutral-300 hover:bg-white/90 dark:hover:bg-white/20'
                            }`}
                          >
                            {isSelected ? `✓ ${rec}` : `+ ${rec}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* DATE SECTION */}
                <div className="flex flex-col gap-1.5 sm:border-l sm:border-black/[0.06] dark:sm:border-white/[0.08] sm:pl-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-600 dark:text-neutral-300" />
                      <span>Date</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      DD-MM-YYYY
                    </span>
                  </div>

                  {/* Editable Text Date Input with Calendar Trigger Icon */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="DD-MM-YYYY (e.g. 22-09-2026)"
                        value={modalDate}
                        onChange={(e) => setModalDate(autoFormatDateInput(e.target.value, modalDate))}
                        onBlur={() => {
                          if (modalDate.trim()) {
                            setModalDate(normalizeToDDMMYYYY(modalDate));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (modalDate.trim()) {
                              setModalDate(normalizeToDDMMYYYY(modalDate));
                            }
                          }
                        }}
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-white/80 dark:border-white/15 bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white outline-hidden focus:border-neutral-900 dark:focus:border-white focus:bg-white/90 dark:focus:bg-white/15 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-all font-medium font-mono backdrop-blur-md"
                      />
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Interactive Calendar Picker Button with invisible native date input overlay */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        className="p-2 rounded-xl bg-white/70 hover:bg-white/90 dark:bg-white/10 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-200 border border-white/80 dark:border-white/15 transition-colors cursor-pointer flex items-center justify-center shadow-2xs backdrop-blur-md"
                        title="Open calendar picker"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={(() => {
                          const parsed = parseAnyDateStringToDate(modalDate);
                          return parsed ? formatDateToYYYYMMDD(parsed) : '';
                        })()}
                        onChange={(e) => {
                          if (e.target.value) {
                            const parts = e.target.value.split('-');
                            if (parts.length === 3) {
                              setModalDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Choose date from calendar"
                      />
                    </div>
                  </div>

                  {/* Formatted Date Preview Badge */}
                  <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-white/5 border border-white/70 dark:border-white/10 backdrop-blur-md">
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Selected:</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                      {getDatePreviewLabel(modalDate)}
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setModalDate(formatDateToDDMMYYYY(new Date()))}
                      className="text-[10px] px-2 py-1 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer transition-colors border border-white/70 dark:border-white/10 backdrop-blur-md shadow-2xs"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDate(formatDateToDDMMYYYY(new Date(Date.now() + 86400000)))}
                      className="text-[10px] px-2 py-1 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer transition-colors border border-white/70 dark:border-white/10 backdrop-blur-md shadow-2xs"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDate(formatDateToDDMMYYYY(new Date(Date.now() + 3 * 86400000)))}
                      className="text-[10px] px-2 py-1 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer transition-colors border border-white/70 dark:border-white/10 backdrop-blur-md shadow-2xs"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDate(formatDateToDDMMYYYY(new Date(Date.now() + 7 * 86400000)))}
                      className="text-[10px] px-2 py-1 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer transition-colors border border-white/70 dark:border-white/10 backdrop-blur-md shadow-2xs"
                    >
                      +1 Week
                    </button>
                    {modalDate && (
                      <button
                        type="button"
                        onClick={() => setModalDate('')}
                        className="text-[10px] px-2 py-1 text-neutral-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD ACTION BUTTONS */}
              <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black active:scale-95 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
