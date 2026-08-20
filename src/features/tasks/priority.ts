import type { Priority } from './types/task';

export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_MARKERS: Record<Priority, string> = {
  low: '·',
  medium: '!',
  high: '!!',
  urgent: '!!!',
};

export const PRIORITY_TEXT_COLORS: Record<Priority, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  urgent: 'text-rose-500',
};
