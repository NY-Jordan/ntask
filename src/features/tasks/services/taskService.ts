import type { NewTaskInput, Priority, Task } from '../types/task';
import { getDb } from '../../../shared/db';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  completed: number;
  priority: Priority;
  category_id: string | null;
  due_date: string | null;
  created_at: string;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed === 1,
    priority: row.priority,
    categoryId: row.category_id ?? undefined,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const db = await getDb();
  const rows = await db.select<TaskRow[]>(
    'SELECT id, title, description, completed, priority, category_id, due_date, created_at FROM tasks ORDER BY created_at DESC',
  );
  return rows.map(rowToTask);
}

export async function createTask(input: NewTaskInput): Promise<Task> {
  const db = await getDb();
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    completed: false,
    priority: input.priority,
    categoryId: input.categoryId,
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
  };
  await db.execute(
    'INSERT INTO tasks (id, title, description, completed, priority, category_id, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      task.id,
      task.title,
      task.description ?? null,
      task.completed ? 1 : 0,
      task.priority,
      task.categoryId ?? null,
      task.dueDate ?? null,
      task.createdAt,
    ],
  );
  return task;
}

export async function updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (changes.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(changes.title);
  }
  if (changes.description !== undefined) {
    fields.push(`description = $${i++}`);
    values.push(changes.description ?? null);
  }
  if (changes.completed !== undefined) {
    fields.push(`completed = $${i++}`);
    values.push(changes.completed ? 1 : 0);
  }
  if (changes.priority !== undefined) {
    fields.push(`priority = $${i++}`);
    values.push(changes.priority);
  }
  if (changes.categoryId !== undefined) {
    fields.push(`category_id = $${i++}`);
    values.push(changes.categoryId ?? null);
  }
  if (changes.dueDate !== undefined) {
    fields.push(`due_date = $${i++}`);
    values.push(changes.dueDate ?? null);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = $${i}`, values);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM tasks WHERE id = $1', [id]);
}

export async function deleteTasks(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDb();
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  await db.execute(`DELETE FROM tasks WHERE id IN (${placeholders})`, ids);
}
