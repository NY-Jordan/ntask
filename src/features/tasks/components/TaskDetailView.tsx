import { useEffect, useState } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../../categories/store/categoryStore';
import type { Link } from '../types/link';
import * as linkService from '../services/linkService';
import { CategoryBadge } from '../../categories/components/CategoryBadge';
import { DatePicker } from '../../../shared/components/DatePicker';
import { PRIORITY_LABELS, PRIORITY_MARKERS, PRIORITY_TEXT_COLORS } from '../priority';
import { formatDateTime, formatRelativeDate, isOverdue, isToday } from '../../../shared/utils/date';
import { ArrowUpRightIcon, CalendarIcon, ChevronLeftIcon, CheckCircleIcon, EditIcon, LinkIcon, TrashIcon } from '../../../shared/components/icons';

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

export function TaskDetailView({ taskId, onBack, onEdit, onDeleted }: TaskDetailViewProps) {
  const task = useTaskStore((s) => s.tasks.find((t) => t.id === taskId));
  const category = useCategoryStore((s) => s.categories.find((c) => c.id === task?.categoryId));
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    linkService.fetchLinksForTask(taskId).then(setLinks);
  }, [taskId]);

  if (!task) {
    onBack();
    return null;
  }

  const dueDateColor = task.dueDate && (isOverdue(task.dueDate) || isToday(task.dueDate)) ? 'text-rose-400' : 'text-white/80';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to list
        </button>
        {category && <CategoryBadge category={category} />}
      </div>

      <h2 className={`text-xl font-bold ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
        {task.title}
      </h2>

      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 font-mono text-xs">
          <span className="text-white/40">PRIORITY:</span>
          <span className={PRIORITY_TEXT_COLORS[task.priority]}>
            {PRIORITY_MARKERS[task.priority]} {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 font-mono text-xs">
            <span className="text-white/40">DUE DATE:</span>
            <span className={dueDateColor}>{formatRelativeDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-white/10" />

      {task.description && (
        <div>
          <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// TASK DESCRIPTION</div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{task.description}</p>
        </div>
      )}

      <div>
        <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// ATTACHED RESOURCES</div>
        {links.length === 0 ? (
          <p className="mt-2 text-sm text-white/30">Aucune ressource</p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white/90">{link.label || link.url}</div>
                  <div className="truncate font-mono text-xs text-blue-400">{link.url}</div>
                </div>
                <button
                  onClick={() => openUrl(link.url)}
                  className="shrink-0 text-blue-400 hover:text-blue-300"
                  aria-label="Ouvrir le lien"
                >
                  <ArrowUpRightIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="font-mono text-xs text-white/30">Created: {formatDateTime(task.createdAt)}</div>

      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex flex-col items-center gap-1.5">
          <DatePicker
            value={task.dueDate ?? ''}
            onChange={(d) => updateTask(taskId, { dueDate: d || undefined })}
            allowClear
            confirmOnSelect
            icon={<CalendarIcon className="h-4 w-4" />}
            triggerClassName="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400"
          />
          <span className="text-[10px] font-medium text-white/40">Reporter</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-400"
            aria-label="Modifier"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-medium text-white/40">Modifier</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => toggleTask(taskId)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              task.completed ? 'bg-white/10 text-white/70 hover:bg-white/15' : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
            aria-label={task.completed ? 'Rouvrir' : 'Marquer comme terminée'}
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-medium text-white/40">{task.completed ? 'Rouvrir' : 'Terminer'}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => {
              deleteTask(taskId);
              onDeleted();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 transition-colors hover:bg-rose-500/25"
            aria-label="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <span className="text-[10px] font-medium text-white/40">Supprimer</span>
        </div>
      </div>
    </div>
  );
}
