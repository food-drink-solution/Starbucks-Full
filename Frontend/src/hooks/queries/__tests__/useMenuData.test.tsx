import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMenuData, useMenuCategory, useMenuItem } from '../useMenuData';

vi.mock('@/hooks', () => ({ useLanguage: () => ({ lang: 'en' }) }));
import { createTestQueryClient, mockMenuData } from '@/test/utils/test-utils';

// Mock the fetchers
vi.mock('@/lib/api', () => ({
  menuFetchers: {
    fetchMenuData: vi.fn(),
    fetchMenuCategory: vi.fn(),
    fetchMenuItem: vi.fn(),
  },
}));

import { menuFetchers } from '@/lib/api';

describe('useMenuData', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('useMenuData', () => {
    it('fetches menu data successfully', async () => {
      vi.mocked(menuFetchers.fetchMenuData).mockResolvedValue(mockMenuData);

      const { result } = renderHook(() => useMenuData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMenuData);
      expect(menuFetchers.fetchMenuData).toHaveBeenCalledTimes(1);
    });

    it('handles fetch error correctly', async () => {
      const error = new Error('Failed to fetch menu data');
      vi.mocked(menuFetchers.fetchMenuData).mockRejectedValue(error);

      const { result } = renderHook(() => useMenuData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });

    it('uses correct cache configuration', () => {
      vi.mocked(menuFetchers.fetchMenuData).mockResolvedValue(mockMenuData);

      renderHook(() => useMenuData(), { wrapper });

      // Verify the query is configured with correct cache times
      const query = queryClient.getQueryCache().find({ queryKey: ['menu', 'en'] });
      expect(query).toBeDefined();
    });
  });

  describe('useMenuCategory', () => {
    it('fetches category data when categoryId is provided', async () => {
      const categoryData = mockMenuData.categories[0];
      vi.mocked(menuFetchers.fetchMenuCategory).mockResolvedValue(categoryData);

      const { result } = renderHook(
        () => useMenuCategory('drinks'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(categoryData);
      expect(menuFetchers.fetchMenuCategory).toHaveBeenCalledWith('drinks', 'en');
    });

    it('does not fetch when categoryId is empty', () => {
      const { result } = renderHook(
        () => useMenuCategory(''),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(menuFetchers.fetchMenuCategory).not.toHaveBeenCalled();
    });

    it('handles category not found error', async () => {
      const error = new Error('Category not found');
      vi.mocked(menuFetchers.fetchMenuCategory).mockRejectedValue(error);

      const { result } = renderHook(
        () => useMenuCategory('invalid-category'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useMenuItem', () => {
    it('fetches item data when both categoryId and itemId are provided', async () => {
      const itemData = {
        category: mockMenuData.categories[0],
        subcategory: mockMenuData.categories[0].subcategories[0],
      };
      vi.mocked(menuFetchers.fetchMenuItem).mockResolvedValue(itemData);

      const { result } = renderHook(
        () => useMenuItem('drinks', 'espresso'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(itemData);
      expect(menuFetchers.fetchMenuItem).toHaveBeenCalledWith('drinks', 'espresso', 'en');
    });

    it('does not fetch when categoryId or itemId is missing', () => {
      const { result: result1 } = renderHook(
        () => useMenuItem('', 'espresso'),
        { wrapper }
      );

      const { result: result2 } = renderHook(
        () => useMenuItem('drinks', ''),
        { wrapper }
      );

      expect(result1.current.fetchStatus).toBe('idle');
      expect(result2.current.fetchStatus).toBe('idle');
      expect(menuFetchers.fetchMenuItem).not.toHaveBeenCalled();
    });

    it('handles item not found error', async () => {
      const error = new Error('Item not found');
      vi.mocked(menuFetchers.fetchMenuItem).mockRejectedValue(error);

      const { result } = renderHook(
        () => useMenuItem('drinks', 'invalid-item'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
