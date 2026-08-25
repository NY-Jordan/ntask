import { useEffect, useMemo } from 'react';
import { useTaskStore } from '../store/taskStore';

export function useTasksByDate(date: string) {
  const tasks = useTaskStore((s) => s.tasks);
  const isLoaded = useTaskStore((s) => s.isLoaded);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  useEffect(() => {
    if (!isLoaded) {
      loadTasks();
    }
  }, [isLoaded, loadTasks]);

  const tasksForDate = useMemo(() => tasks.filter((t) => t.dueDate?.slice(0, 10) === date), [tasks, date]);

  const completedCount = useMemo(() => tasksForDate.filter((t) => t.completed).length, [tasksForDate]);

  return { tasks: tasksForDate, completedCount, total: tasksForDate.length, isLoaded };
}
