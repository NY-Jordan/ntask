import { useEffect, useRef, useState } from 'react';
import type { Category } from '../types/category';
import { ChevronDownIcon } from '../../../shared/components/icons';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

/**
 * A native <select> renders as a separate top-level GTK popup in
 * WebKitGTK, which steals window focus and fires `window.blur` on the main
 * webview — triggering useCloseOnBlur and closing the whole panel the
 * instant the dropdown opens. This is an in-DOM replacement that never
 * leaves the webview, so it can't blur the window.
 */
export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function select(categoryId: string) {
    onChange(categoryId);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-left text-sm text-white outline-none focus:border-blue-500"
      >
        <span className="flex items-center gap-1.5 truncate">
          {selected && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: selected.color }} />}
          {selected ? selected.name : 'Aucune'}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-xl">
          <button
            type="button"
            onClick={() => select('')}
            className="flex w-full items-center px-2.5 py-1.5 text-left text-sm text-white/70 hover:bg-white/10"
          >
            Aucune
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c.id)}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-sm text-white/90 hover:bg-white/10"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
