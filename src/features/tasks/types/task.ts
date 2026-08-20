export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: Priority;
  categoryId?: string;
  dueDate?: string;
}
