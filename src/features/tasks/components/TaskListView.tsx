import { useEffect, useMemo, useRef, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useTasksByDate } from '../hooks/useTasksByDate';
import { useCategories } from '../../categories/hooks/useCategories';
import { TaskItem } from './TaskItem';
import { SearchIcon, TrashIcon } from '../../../shared/components/icons';
import * as linkService from '../services/linkService';

type Filter = 'all' | 'urgent' | string;

interface TaskListViewProps {
  onSelectTask: (taskId: string) => void;
  date: string;
}

export function TaskListView({ onSelectTask, date }: TaskListViewProps) {
  const { tasks, isLoaded } = useTasksByDate(date);
  const { categories } = useCategories();
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const deleteTasks = useTaskStore((s) => s.deleteTasks);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [taskIdsWithLinks, setTaskIdsWithLinks] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    linkService
      .fetchAllLinks()
      .then((links) => setTaskIdsWithLinks(new Set(links.flatMap((l) => (l.taskId ? [l.taskId] : [])))));
  }, [tasks.length]);

  useEffect(() => {
    setConfirmClear(false);
  }, [date]);

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      confirmTimer.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearTimeout(confirmTimer.current);
    setConfirmClear(false);
    deleteTasks(tasks.map((t) => t.id));
  }

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
      if (filter === 'urgent') return t.priority === 'urgent';
      if (filter !== 'all') return t.categoryId === filter;
      return true;
    });
  }, [tasks, query, filter]);

  const active = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-3 px-1 pb-1">
      <div className="relative flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <SearchIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-white/30" />
        <span className="shrink-0 font-mono text-sm text-white/30">$</span>
        <span className="ml-1.5 shrink-0 font-mono text-sm text-white/30">search_tasks --query</span>
        <span className="ml-1 font-mono text-sm text-white/30">"</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none"
        />
        <span className="mr-1 font-mono text-sm text-white/30">"</span>
        <span className="h-4 w-1.5 shrink-0 animate-pulse rounded-sm bg-blue-500" />
      </div>

      <div className="flex items-center gap-1.5">
        <div className="scrollbar-none flex flex-1 gap-1.5 overflow-x-auto pb-1">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
          {categories.map((c) => (
            <FilterPill key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.name} />
          ))}
          <FilterPill active={filter === 'urgent'} onClick={() => setFilter('urgent')} label="Urgent" />
        </div>
        {tasks.length > 0 && (
          <button
            onClick={handleClear}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              confirmClear ? 'bg-rose-500 text-white' : 'bg-white/[0.05] text-white/40 hover:bg-white/10 hover:text-rose-400'
            }`}
          >
            <TrashIcon className="h-3 w-3" />
            {confirmClear ? 'Confirmer' : 'Vider'}
          </button>
        )}
      </div>

      {!isLoaded && <p className="px-2 py-4 text-sm text-white/30">Chargement…</p>}
      {isLoaded && filtered.length === 0 && (
        <p className="px-2 py-4 text-sm text-white/30">Aucune tâche ne correspond</p>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel>ACTIVE TASKS ({active.length})</SectionLabel>
          {active.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={task.categoryId ? categoriesById.get(task.categoryId) : undefined}
              hasLinks={taskIdsWithLinks.has(task.id)}
              onToggle={toggleTask}
              onSelect={() => onSelectTask(task.id)}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel>COMPLETED TASKS ({completed.length})</SectionLabel>
          {completed.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={task.categoryId ? categoriesById.get(task.categoryId) : undefined}
              hasLinks={taskIdsWithLinks.has(task.id)}
              onToggle={toggleTask}
              onSelect={() => onSelectTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// {children}</div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-blue-500 text-white' : 'bg-white/[0.05] text-white/60 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}
