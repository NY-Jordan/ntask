import type { Category } from '../types/category';

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-medium"
      style={{ borderColor: `${category.color}80`, color: category.color }}
    >
      {category.name}
    </span>
  );
}
