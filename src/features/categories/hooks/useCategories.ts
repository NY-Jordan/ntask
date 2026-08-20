import { useEffect } from 'react';
import { useCategoryStore } from '../store/categoryStore';

export function useCategories() {
  const categories = useCategoryStore((s) => s.categories);
  const isLoaded = useCategoryStore((s) => s.isLoaded);
  const loadCategories = useCategoryStore((s) => s.loadCategories);

  useEffect(() => {
    if (!isLoaded) {
      loadCategories();
    }
  }, [isLoaded, loadCategories]);

  return { categories, isLoaded };
}
