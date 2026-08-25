import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  triggerClassName?: string;
  placeholder?: string;
  allowClear?: boolean;
  /** Icon-only trigger (no date text) — for compact circular buttons. */
  icon?: ReactNode;
  /** Require an explicit "Confirmer" click instead of applying on day click. */
  confirmOnSelect?: boolean;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISO(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatShort(value: string): string {
  return parseISO(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * A native <input type="date"> opens its calendar as a separate top-level
 * GTK popup in WebKitGTK — same class of problem documented in
 * CategorySelect: it doesn't reliably close on an outside click, and it can
 * steal window focus. This is an in-DOM replacement that never leaves the
 * webview, so outside-click handling is fully under our control.
 */
export function DatePicker({
  value,
  onChange,
  triggerClassName,
  placeholder = 'Aucune',
  allowClear,
  icon,
  confirmOnSelect,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(value);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ? parseISO(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

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

  function open() {
    const base = value ? parseISO(value) : new Date();
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setPending(value);
    setIsOpen(true);
  }

  function pick(date: Date) {
    const iso = toISO(date);
    if (confirmOnSelect) {
      setPending(iso);
      return;
    }
    onChange(iso);
    setIsOpen(false);
  }

  function confirm() {
    onChange(pending);
    setIsOpen(false);
  }

  const today = new Date();
  const firstOfMonth = viewMonth;
  const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), i + 1)),
  ];
  const highlighted = confirmOnSelect ? pending : value;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        className={
          triggerClassName ??
          'flex w-full items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-left text-sm text-white outline-none focus:border-blue-500'
        }
      >
        {icon ?? <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-white/40" />}
        {!icon && <span className={value ? '' : 'text-white/30'}>{value ? formatShort(value) : placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-60 rounded-lg border border-white/10 bg-neutral-800 p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() - 1, 1))}
              className="text-white/40 hover:text-white/80"
              aria-label="Mois précédent"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-xs font-medium text-white/80">
              {firstOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 1))}
              className="text-white/40 hover:text-white/80"
              aria-label="Mois suivant"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="text-[10px] font-medium text-white/30">
                {d}
              </span>
            ))}
            {cells.map((date, i) => {
              if (!date) return <span key={i} />;
              const iso = toISO(date);
              const isSelected = iso === highlighted;
              const isToday = iso === toISO(today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(date)}
                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : isToday
                        ? 'text-blue-400 hover:bg-white/10'
                        : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={() => pick(today)}
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Aujourd'hui
            </button>
            {allowClear && value && !confirmOnSelect && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-xs font-medium text-white/40 hover:text-rose-400"
              >
                Effacer
              </button>
            )}
            {confirmOnSelect && (
              <button
                type="button"
                onClick={confirm}
                disabled={!pending}
                className="rounded-md bg-blue-500 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-400 disabled:opacity-40"
              >
                Confirmer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
