import { useEffect, useMemo, useState } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useCategories } from '../../categories/hooks/useCategories';
import { useCategoryStore } from '../../categories/store/categoryStore';
import { CategorySelect } from '../../categories/components/CategorySelect';
import { CategoryBadge } from '../../categories/components/CategoryBadge';
import * as linkService from '../services/linkService';
import type { AggregatedLink } from '../services/linkService';
import { LinkFavicon } from './LinkFavicon';
import { ArrowUpRightIcon, PlusIcon, TrashIcon } from '../../../shared/components/icons';

interface LinkManagerViewProps {
  onSelectTask: (taskId: string) => void;
}

const UNCATEGORIZED = '__uncategorized__';

export function LinkManagerView({ onSelectTask }: LinkManagerViewProps) {
  useCategories();
  const categories = useCategoryStore((s) => s.categories);
  const [links, setLinks] = useState<AggregatedLink[] | null>(null);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function refresh() {
    return linkService.fetchAllLinks().then(setLinks);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setIsSaving(true);
    await linkService.createStandaloneLink({
      url: trimmed,
      label: label.trim() || undefined,
      categoryId: categoryId || undefined,
    });
    setUrl('');
    setLabel('');
    setIsSaving(false);
    await refresh();
  }

  async function handleDelete(id: string) {
    await linkService.deleteLink(id);
    await refresh();
  }

  const grouped = useMemo(() => {
    if (!links) return [];
    const byCategory = new Map<string, AggregatedLink[]>();
    for (const link of links) {
      const key = link.resolvedCategoryId ?? UNCATEGORIZED;
      const list = byCategory.get(key) ?? [];
      list.push(link);
      byCategory.set(key, list);
    }
    return [...byCategory.entries()].map(([catId, catLinks]) => ({
      category: categories.find((c) => c.id === catId),
      links: catLinks,
    }));
  }, [links, categories]);

  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-xs font-medium uppercase tracking-wide text-blue-400">// MANAGE LINKS</div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nom (optionnel)"
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500"
          />
          <div className="w-32 shrink-0">
            <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
          </div>
        </div>
        <button
          type="submit"
          disabled={!url.trim() || isSaving}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Ajouter le lien
        </button>
      </form>

      {links === null && <p className="text-sm text-white/30">Chargement…</p>}
      {links !== null && links.length === 0 && <p className="text-sm text-white/30">Aucun lien pour l'instant</p>}

      {grouped.map(({ category, links: categoryLinks }) => (
        <div key={category?.id ?? UNCATEGORIZED} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {category ? (
              <CategoryBadge category={category} />
            ) : (
              <span className="text-xs font-medium uppercase tracking-wide text-white/40">Sans catégorie</span>
            )}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {categoryLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <LinkFavicon url={link.url} className="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white/90">{link.label || link.url}</div>
                <div className="truncate font-mono text-xs text-blue-400">{link.url}</div>
                {link.taskId && link.taskTitle && (
                  <button
                    onClick={() => onSelectTask(link.taskId!)}
                    className="mt-0.5 truncate text-left text-xs text-white/35 hover:text-white/60"
                  >
                    TASK: {link.taskTitle}
                  </button>
                )}
              </div>
              <button
                onClick={() => openUrl(link.url)}
                className="shrink-0 text-blue-400 hover:text-blue-300"
                aria-label="Ouvrir le lien"
              >
                <ArrowUpRightIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="shrink-0 text-white/30 hover:text-rose-400"
                aria-label="Supprimer le lien"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ))}

      {links !== null && links.length > 0 && (
        <div className="rounded-xl border border-white/10 p-3 text-sm text-white/80">
          Total : {links.length} lien{links.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
