import type { Link, NewLinkInput } from '../types/link';
import { getDb } from '../../../shared/db';

interface LinkRow {
  id: string;
  url: string;
  label: string | null;
  task_id: string | null;
  category_id: string | null;
  created_at: string;
}

function rowToLink(row: LinkRow): Link {
  return {
    id: row.id,
    url: row.url,
    label: row.label ?? undefined,
    taskId: row.task_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchLinksForTask(taskId: string): Promise<Link[]> {
  const db = await getDb();
  const rows = await db.select<LinkRow[]>(
    'SELECT id, url, label, task_id, category_id, created_at FROM links WHERE task_id = $1 ORDER BY created_at ASC',
    [taskId],
  );
  return rows.map(rowToLink);
}

export async function fetchStandaloneLinks(): Promise<Link[]> {
  const db = await getDb();
  const rows = await db.select<LinkRow[]>(
    'SELECT id, url, label, task_id, category_id, created_at FROM links WHERE task_id IS NULL ORDER BY created_at DESC',
  );
  return rows.map(rowToLink);
}

interface AggregatedLinkRow extends LinkRow {
  task_title: string | null;
  task_category_id: string | null;
}

export interface AggregatedLink extends Link {
  taskTitle?: string;
  resolvedCategoryId?: string;
}

export async function fetchAllLinks(): Promise<AggregatedLink[]> {
  const db = await getDb();
  const rows = await db.select<AggregatedLinkRow[]>(
    `SELECT links.id, links.url, links.label, links.task_id, links.category_id, links.created_at,
            tasks.title AS task_title, tasks.category_id AS task_category_id
     FROM links
     LEFT JOIN tasks ON tasks.id = links.task_id
     ORDER BY links.created_at DESC`,
  );
  return rows.map((row) => ({
    ...rowToLink(row),
    taskTitle: row.task_title ?? undefined,
    resolvedCategoryId: row.category_id ?? row.task_category_id ?? undefined,
  }));
}

export async function addLink(taskId: string, input: NewLinkInput): Promise<Link> {
  return insertLink({ ...input, taskId });
}

export async function createStandaloneLink(input: NewLinkInput): Promise<Link> {
  return insertLink(input);
}

async function insertLink(input: NewLinkInput & { taskId?: string }): Promise<Link> {
  const db = await getDb();
  const link: Link = {
    id: crypto.randomUUID(),
    url: input.url,
    label: input.label,
    taskId: input.taskId,
    categoryId: input.categoryId,
    createdAt: new Date().toISOString(),
  };
  await db.execute(
    'INSERT INTO links (id, url, label, task_id, category_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [link.id, link.url, link.label ?? null, link.taskId ?? null, link.categoryId ?? null, link.createdAt],
  );
  return link;
}

export async function deleteLink(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM links WHERE id = $1', [id]);
}
