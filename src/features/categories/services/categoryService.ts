import type { Category, NewCategoryInput } from '../types/category';
import { getDb } from '../../../shared/db';

interface CategoryRow {
  id: string;
  name: string;
  color: string;
}

function rowToCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, color: row.color };
}

export async function fetchCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.select<CategoryRow[]>('SELECT id, name, color FROM categories ORDER BY name ASC');
  return rows.map(rowToCategory);
}

export async function createCategory(input: NewCategoryInput): Promise<Category> {
  const db = await getDb();
  const category: Category = { id: crypto.randomUUID(), name: input.name, color: input.color };
  await db.execute('INSERT INTO categories (id, name, color) VALUES ($1, $2, $3)', [
    category.id,
    category.name,
    category.color,
  ]);
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM categories WHERE id = $1', [id]);
}
