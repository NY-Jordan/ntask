import { useMemo, useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useCategoryStore } from '../store/categoryStore';
import { useTaskStore } from '../../tasks/store/taskStore';
import { CATEGORY_COLORS } from '../constants';
import { TrashIcon } from '../../../shared/components/icons';

export function CategoryManagerView() {
  const { categories } = useCategories();
  const tasks = useTaskStore((s) => s.tasks);
  const addCategory = useCategoryStore((s) => s.addCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of tasks) {
      if (!task.categoryId) continue;
      counts.set(task.categoryId, (counts.get(task.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [tasks]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory({ name: trimmed, color });
    setName('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// MANAGE CATEGORIES</div>

      {categories.length === 0 ? (
        <p className="text-sm text-white/30">Aucune catégorie pour l'instant</p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="flex-1 truncate text-sm font-semibold text-white/90">{c.name}</span>
              <span className="shrink-0 font-mono text-xs text-white/40">{taskCounts.get(c.id) ?? 0} tasks</span>
              <button
                onClick={() => deleteCategory(c.id)}
                className="shrink-0 rounded-lg bg-rose-500/15 p-2 text-rose-400 transition-colors hover:bg-rose-500/25"
                aria-label={`Supprimer la catégorie ${c.name}`}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// NEW CATEGORY</div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <div>
          <label className="font-mono text-xs font-medium uppercase tracking-wide text-white/40">Category name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="font-mono text-xs font-medium uppercase tracking-wide text-white/40">Color dot selector</label>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: c }}
                aria-label={`Choisir la couleur ${c}`}
              >
                {color === c && <span className="h-2 w-2 rounded-full bg-black/50" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-1 w-full rounded-xl bg-blue-500 py-2.5 font-mono text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
        >
          + create_category "{name.trim() || '…'}"
        </button>
      </form>
    </div>
  );
}
