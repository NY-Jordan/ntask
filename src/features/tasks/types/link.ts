export interface Link {
  id: string;
  url: string;
  label?: string;
  taskId?: string;
  categoryId?: string;
  createdAt: string;
}

export interface NewLinkInput {
  url: string;
  label?: string;
  categoryId?: string;
}
