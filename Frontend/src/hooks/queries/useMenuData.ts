import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { menuFetchers } from "@/lib/api";
import { useLanguage } from "@/hooks";
import type { MenuData } from "@/types";
import { CACHE_TIMES } from "@/lib/core/constants";

/**
 * Fetch all menu data for the current UI language.
 *
 * The language is read from the active URL locale (ar | en) and forwarded to
 * the Backend API so content is resolved server-side. The query key includes
 * the language so React Query keeps separate caches per locale.
 */
export function useMenuData(): UseQueryResult<MenuData, Error> {
  const { lang } = useLanguage();

  return useQuery({
    queryKey: [...queryKeys.menu.all(), lang],
    queryFn: () => menuFetchers.fetchMenuData(lang),
    staleTime: CACHE_TIMES.MENU_STALE,
    gcTime: CACHE_TIMES.MENU_GC,
  });
}

/**
 * Fetch specific menu category for the current UI language.
 */
export function useMenuCategory(categoryId: string) {
  const { lang } = useLanguage();

  return useQuery({
    queryKey: [...queryKeys.menu.byCategory(categoryId), lang],
    queryFn: () => menuFetchers.fetchMenuCategory(categoryId, lang),
    staleTime: CACHE_TIMES.MENU_STALE,
    gcTime: CACHE_TIMES.MENU_GC,
    enabled: !!categoryId,
  });
}

/**
 * Fetch specific menu item details for the current UI language.
 */
export function useMenuItem(categoryId: string, itemId: string) {
  const { lang } = useLanguage();

  return useQuery({
    queryKey: [...queryKeys.menu.byItem(categoryId, itemId), lang],
    queryFn: () => menuFetchers.fetchMenuItem(categoryId, itemId, lang),
    staleTime: CACHE_TIMES.MENU_STALE,
    gcTime: CACHE_TIMES.MENU_GC,
    enabled: !!categoryId && !!itemId,
  });
}
