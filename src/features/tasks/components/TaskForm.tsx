import { useEffect, useState } from 'react';
import type { Priority } from '../types/task';
import { useTaskStore } from '../store/taskStore';
import { useCategories } from '../../categories/hooks/useCategories';
import { CategorySelect } from '../../categories/components/CategorySelect';
import { PrioritySelector } from './PrioritySelector';
import { UrlAttachmentField, type PendingLink } from './UrlAttachmentField';
import { todayISODate } from '../../../shared/utils/date';
import * as linkService from '../services/linkService';

interface TaskFormProps {
  taskId?: string;
  onCancel: () => void;
  onDone: () => void;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500';
const labelClass = 'font-mono text-xs font-medium uppercase tracking-wide text-white/40';

export function TaskForm({ taskId, onCancel, onDone }: TaskFormProps) {
  const existingTask = useTaskStore((s) => (taskId ? s.tasks.find((t) => t.id === taskId) : undefined));
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const { categories } = useCategories();

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [categoryId, setCategoryId] = useState(existingTask?.categoryId ?? '');
  const [priority, setPriority] = useState<Priority>(existingTask?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate ?? todayISODate());
  const [links, setLinks] = useState<PendingLink[]>([]);
  const [existingLinkIds, setExistingLinkIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    linkService.fetchLinksForTask(taskId).then((fetched) => {
      setLinks(fetched.map((l) => ({ id: l.id, url: l.url, label: l.label })));
      setExistingLinkIds(fetched.map((l) => l.id));
    });
  }, [taskId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setIsSaving(true);

    const input = {
      title: trimmed,
      description: description.trim() || undefined,
      priority,
      categoryId: categoryId || undefined,
      dueDate: dueDate || undefined,
    };

    const resolvedTaskId = taskId ?? (await addTask(input)).id;
    if (taskId) await updateTask(taskId, input);

    const keptIds = links.filter((l) => l.id).map((l) => l.id!);
    const removedIds = existingLinkIds.filter((id) => !keptIds.includes(id));
    await Promise.all([
      ...removedIds.map((id) => linkService.deleteLink(id)),
      ...links.filter((l) => !l.id).map((l) => linkService.addLink(resolvedTaskId, { url: l.url, label: l.label })),
    ]);

    setIsSaving(false);
    onDone();
  }

  return (
    <div className="animate-[fadeSlideUp_0.15s_ease-out] flex flex-col gap-4">
      <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">
        // {taskId ? 'EDIT TASK' : 'CREATE NEW TASK'}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className={labelClass}>Title</label>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Category</label>
            <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="flex-1">
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Priority level</label>
          <div className="mt-1">
            <PrioritySelector value={priority} onChange={setPriority} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Attached URL</label>
          <div className="mt-1">
            <UrlAttachmentField links={links} onChange={setLinks} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSaving}
            className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
          >
            Save Task
          </button>
        </div>
      </form>
    </div>
  );
}
