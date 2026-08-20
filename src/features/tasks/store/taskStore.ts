import { create } from 'zustand';
import type { NewTaskInput, Task } from '../types/task';
import * as taskService from '../services/taskService';

interface TaskStore {
  tasks: Task[];
  isLoaded: boolean;
  loadTasks: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoaded: false,

  loadTasks: async () => {
    const tasks = await taskService.fetchTasks();
    set({ tasks, isLoaded: true });
  },

  addTask: async (input) => {
    const task = await taskService.createTask(input);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id, changes) => {
    await taskService.updateTask(id, changes);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    }));
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  deleteTasks: async (ids) => {
    await taskService.deleteTasks(ids);
    const idSet = new Set(ids);
    set((state) => ({ tasks: state.tasks.filter((t) => !idSet.has(t.id)) }));
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    await get().updateTask(id, { completed: !task.completed });
  },
}));
