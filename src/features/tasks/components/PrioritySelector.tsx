import type { Priority } from '../types/task';
import { PRIORITIES, PRIORITY_LABELS } from '../priority';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
            value === p ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white/80'
          }`}
        >
          {PRIORITY_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
