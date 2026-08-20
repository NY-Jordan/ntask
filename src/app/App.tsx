import { useState } from 'react';
import { TaskFab } from '../features/tasks/components/TaskFab';
import { TaskPanel } from '../features/tasks/components/TaskPanel';
import { useWindowMode, type PanelMode } from '../features/tasks/hooks/useWindowMode';
import { useCloseOnBlur } from '../features/tasks/hooks/useCloseOnBlur';

export function App() {
  const [mode, setMode] = useState<PanelMode>('list');
  const [isPinned, setIsPinned] = useState(false);
  const isOpen = mode !== 'fab';

  useWindowMode(mode);
  useCloseOnBlur(isOpen && !isPinned, () => setMode('fab'));

  return (
    <div className={`h-screen w-screen ${isOpen ? 'p-1.5' : 'p-0'}`}>
      {mode === 'fab' ? (
        <TaskFab onDoubleClick={() => setMode('list')} />
      ) : (
        <TaskPanel
          mode={mode}
          onModeChange={setMode}
          onClose={() => setMode('fab')}
          isPinned={isPinned}
          onTogglePinned={() => setIsPinned((p) => !p)}
        />
      )}
    </div>
  );
}
