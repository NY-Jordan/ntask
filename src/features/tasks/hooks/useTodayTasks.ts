import { useEffect, useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';
import { isOverdue, isToday } from '../../../shared/utils/date';

export function useTodayTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    if (!isLoaded) {
      loadTasks();
    }
  }, [isLoaded, loadTasks]);

  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.dueDate || isToday(t.dueDate) || isOverdue(t.dueDate)),
    [tasks],
  );

  const completedCount = useMemo(() => todayTasks.filter((t) => t.completed).length, [todayTasks]);

  return { tasks: todayTasks, completedCount, total: todayTasks.length, isLoaded };
}
