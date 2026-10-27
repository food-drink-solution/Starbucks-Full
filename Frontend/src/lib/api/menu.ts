import { menuService } from "@/services/api/menuService";
import type { MenuData, MenuCategory } from "@/types";
import { AppError, ErrorType } from '@/lib/error';
import mockMenuData from '@/data/menu/menu.json';
import type { MenuData as MenuDataType } from '@/lib/schemas/menu';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const typedMockData = mockMenuData as unknown as MenuDataType;

export const menuFetchers = {
  /**
   * Fetch all menu categories from Backend Resources API.
   * Falls back to local data if API unavailable.
   */
  async fetchMenuData(language: string = 'en'): Promise<MenuData> {
    // The Resources API may serve a localization bundle whose `categories`
    // is an object keyed by slug — MenuPage needs a flat array. Only trust
    // the resources payload when it actually contains the array; otherwise
    // resolve the catalog from the Menu API (with its own mock fallback).
    try {
      const response = await fetch(
        `${API_URL}/v1/resources/localization/${language}/menu`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        const menuResources = data.resources;

        if (Array.isArray(menuResources?.categories)) {
          return {
            categories: menuResources.categories,
            allergyInfo: menuResources.allergyInfo,
            sidebar: menuResources.sidebar,
          } as MenuData;
        }
      }
    } catch (err) {
      console.warn('Backend Resources API unavailable, using fallback', err);
    }

    try {
      const categories = await menuService.getCategories(language);
      return {
        categories,
        allergyInfo: typedMockData.allergyInfo,
        sidebar: typedMockData.sidebar,
      };
    } catch {
      return typedMockData;
    }
  },

  /**
   * Fetch specific menu category by slug.
   */
  async fetchMenuCategory(slug: string, language: string = 'en'): Promise<MenuCategory> {
    return menuService.getCategory(slug, language);
  },

  /**
   * Fetch specific menu item details.
   */
  async fetchMenuItemDetails(categoryId: string, itemId: string, language: string = 'en') {
    const category = await this.fetchMenuCategory(categoryId, language);
    for (const subcategory of category.subcategories || []) {
      const item = subcategory.items?.find((i) => i.id === itemId);
      if (item) return { category, subcategory, item };
    }
    throw new AppError(`Item not found: ${itemId}`, ErrorType.NOT_FOUND, 404);
  },

  /** Backward compat */
  async fetchMenuItem(categoryId: string, subcategoryId: string, language: string = 'en') {
    const category = await this.fetchMenuCategory(categoryId, language);
    const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
    if (!category || !subcategory) {
      throw new AppError(`Subcategory not found: ${subcategoryId}`, ErrorType.NOT_FOUND, 404);
    }
    return { category, subcategory };
  }
};
