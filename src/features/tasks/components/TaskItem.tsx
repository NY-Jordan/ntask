import type { Task } from '../types/task';
import type { Category } from '../../categories/types/category';
import { CheckIcon, LinkIcon } from '../../../shared/components/icons';
import { CategoryBadge } from '../../categories/components/CategoryBadge';
import { PRIORITY_LABELS, PRIORITY_MARKERS, PRIORITY_TEXT_COLORS } from '../priority';
import { formatRelativeDate } from '../../../shared/utils/date';

interface TaskItemProps {
  task: Task;
  category?: Category;
  hasLinks?: boolean;
  onToggle: (id: string) => void;
  onSelect: () => void;
}

export function TaskItem({ task, category, hasLinks, onToggle, onSelect }: TaskItemProps) {
  return (
    <div
      onClick={onSelect}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/20"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          task.completed ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/25 text-transparent hover:border-white/50'
        }`}
        aria-label={task.completed ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
      >
        <CheckIcon className="h-3 w-3" />
      </button>

      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-medium ${task.completed ? 'text-white/35 line-through' : 'text-white/90'}`}>
          {task.title}
        </div>
        <div className={`mt-1 flex items-center gap-1.5 font-mono text-xs ${task.completed ? 'text-white/25' : 'text-white/50'}`}>
          <span className={task.completed ? '' : PRIORITY_TEXT_COLORS[task.priority]}>{PRIORITY_MARKERS[task.priority]}</span>
          <span className={task.completed ? '' : PRIORITY_TEXT_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</span>
          {task.dueDate && (
            <>
              <span>·</span>
              <span>{formatRelativeDate(task.dueDate)}</span>
            </>
          )}
          {hasLinks && <LinkIcon className="h-3 w-3 shrink-0" />}
        </div>
      </div>

      {category && <CategoryBadge category={category} />}
    </div>
  );
}
