import { create } from 'zustand';
import type { Category, NewCategoryInput } from '../types/category';
import * as categoryService from '../services/categoryService';

interface CategoryStore {
  categories: Category[];
  isLoaded: boolean;
  loadCategories: () => Promise<void>;
  addCategory: (input: NewCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  isLoaded: false,

  loadCategories: async () => {
    const categories = await categoryService.fetchCategories();
    set({ categories, isLoaded: true });
  },

  addCategory: async (input) => {
    const category = await categoryService.createCategory(input);
    set((state) => ({ categories: [...state.categories, category].sort((a, b) => a.name.localeCompare(b.name)) }));
  },

  deleteCategory: async (id) => {
    await categoryService.deleteCategory(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
}));
