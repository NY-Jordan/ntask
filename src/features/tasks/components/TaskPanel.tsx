import { useState } from 'react';
import type { PanelMode } from '../hooks/useWindowMode';
import { TaskListView } from './TaskListView';
import { TaskForm } from './TaskForm';
import { TaskDetailView } from './TaskDetailView';
import { ResizeHandle } from './ResizeHandle';
import { CategoryManagerView } from '../../categories/components/CategoryManagerView';
import { LinkManagerView } from './LinkManagerView';
import { CalendarIcon, ChevronLeftIcon, LinkIcon, PinIcon, PlusIcon, TerminalIcon } from '../../../shared/components/icons';
import { todayISODate } from '../../../shared/utils/date';

interface TaskPanelProps {
  mode: Exclude<PanelMode, 'fab'>;
  onModeChange: (mode: PanelMode) => void;
  onClose: () => void;
  isPinned: boolean;
  onTogglePinned: () => void;
}

const HEADER_PATHS: Record<Exclude<PanelMode, 'fab'>, string> = {
  list: '~/tasks',
  add: '~/tasks/new',
  edit: '~/tasks/edit',
  detail: '~/tasks/view',
  categories: '~/categories',
  links: '~/links',
};

const BACK_TARGET: Partial<Record<PanelMode, PanelMode>> = {
  add: 'list',
  edit: 'detail',
  detail: 'list',
  categories: 'list',
  links: 'list',
};

export function TaskPanel({ mode, onModeChange, onClose, isPinned, onTogglePinned }: TaskPanelProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayISODate());

  function openDetail(taskId: string) {
    setSelectedTaskId(taskId);
    onModeChange('detail');
  }

  function openEdit(taskId: string) {
    setSelectedTaskId(taskId);
    onModeChange('edit');
  }

  return (
    <div className="relative  flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl">
      <div
        data-tauri-drag-region
        className="grid shrink-0 cursor-grab grid-cols-[auto_1fr_auto] w-full items-center gap-2 border-b border-white/10 px-4 py-3 active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5">
          <button onClick={onClose} className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-label="Fermer" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <button
            onClick={onTogglePinned}
            className={`ml-1 flex items-center ${isPinned ? 'text-blue-400' : 'text-white/40 hover:text-white/80'}`}
            aria-label={isPinned ? 'Désépingler le panel' : 'Épingler le panel'}
            title={isPinned ? 'Reste ouvert même en cliquant ailleurs' : 'Se ferme en cliquant ailleurs'}
          >
            <PinIcon className="h-3.5 w-3.5" fill={isPinned ? 'currentColor' : 'none'} />
          </button>
        </div>
        <span className="truncate text-center font-mono text-xs text-white/40">[TF] {HEADER_PATHS[mode]}</span>
        {mode === 'list' ? (
          <div className="flex items-center gap-2 justify-self-end">
            <label
              className={`flex items-center gap-1 ${selectedDate !== todayISODate() ? 'text-blue-400' : 'text-white/40 hover:text-white/80'}`}
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value || todayISODate())}
                className="w-[6.5rem] bg-transparent font-mono text-xs text-current outline-none [color-scheme:dark]"
              />
            </label>
            <button
              onClick={() => onModeChange('links')}
              className="text-white/40 hover:text-white/80"
              aria-label="Liens"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onModeChange('categories')}
              className="text-white/40 hover:text-white/80"
              aria-label="Catégories"
            >
              <TerminalIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onModeChange(BACK_TARGET[mode] ?? 'list')}
            className="text-white/40 hover:text-white/80"
            aria-label="Retour"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
        {mode === 'list' && <TaskListView onSelectTask={openDetail} date={selectedDate} />}

        {mode === 'add' && <TaskForm onCancel={() => onModeChange('list')} onDone={() => onModeChange('list')} />}

        {mode === 'edit' && selectedTaskId && (
          <TaskForm
            taskId={selectedTaskId}
            onCancel={() => onModeChange('detail')}
            onDone={() => onModeChange('detail')}
          />
        )}

        {mode === 'detail' && selectedTaskId && (
          <TaskDetailView
            taskId={selectedTaskId}
            onBack={() => onModeChange('list')}
            onEdit={() => openEdit(selectedTaskId)}
            onDeleted={() => onModeChange('list')}
          />
        )}

        {mode === 'categories' && <CategoryManagerView />}

        {mode === 'links' && <LinkManagerView onSelectTask={openDetail} />}
      </div>

      {mode === 'list' && (
        <button
          onClick={() => onModeChange('add')}
          className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.7)] transition-transform hover:scale-105 hover:bg-blue-400"
          aria-label="Ajouter une tâche"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      )}

      <ResizeHandle />
    </div>
  );
}
