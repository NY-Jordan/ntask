import { useTodayTasks } from '../hooks/useTodayTasks';

interface TaskFabProps {
  onDoubleClick: () => void;
}

export function TaskFab({ onDoubleClick }: TaskFabProps) {
  const { completedCount, total } = useTodayTasks();
  const remaining = total - completedCount;

  return (
    <button
      data-tauri-drag-region
      onDoubleClick={onDoubleClick}
      className="relative flex h-[64px] w-[64px] cursor-grab flex-col items-center justify-center rounded-full border border-cyan-400/30 bg-neutral-950 transition-transform active:cursor-grabbing active:scale-95"
      aria-label="Ouvrir les tâches du jour"
    >
      <span className="pointer-events-none font-mono text-[28px] font-bold leading-none text-cyan-300">N</span>
      <span className="pointer-events-none mt-1 font-mono text-xs font-semibold uppercase leading-none tracking-widest text-cyan-300/60">
        Task
      </span>
      {remaining > 0 && (
        <span className="pointer-events-none absolute right-1 top-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-neutral-950" />
      )}
    </button>
  );
}
