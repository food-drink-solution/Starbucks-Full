import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { featuredFetchers } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/core/constants";
import { useLanguage } from "@/hooks/i18n/useLanguage";

/**
 * Hook to fetch featured cards
 *
 * Cache Strategy:
 * - Stale Time: 24 hours (static content)
 * - GC Time: 48 hours
 */
export function useFeaturedCards(language?: string) {
  const { lang } = useLanguage();
  const activeLanguage = language ?? lang;
  
  return useQuery({
    queryKey: queryKeys.featured.cards(activeLanguage),
    queryFn: async () => {
      const normalizedLanguage = activeLanguage === 'ar' ? 'ar' : 'en';
      return featuredFetchers.fetchFeaturedCards(normalizedLanguage);
    },
    staleTime: CACHE_TIMES.FEATURED_STALE,
    gcTime: CACHE_TIMES.FEATURED_GC,
  });
}

/**
 * Hook to fetch hero section data
 */
export function useHero(language?: string) {
  const { lang } = useLanguage();
  const activeLanguage = language ?? lang;
  
  return useQuery({
    queryKey: queryKeys.featured.hero(activeLanguage),
    queryFn: async () => {
      const normalizedLanguage = activeLanguage === 'ar' ? 'ar' : 'en';
      return featuredFetchers.fetchHero(normalizedLanguage);
    },
    staleTime: CACHE_TIMES.FEATURED_STALE,
    gcTime: CACHE_TIMES.FEATURED_GC,
  });
}

/**
 * Hook to fetch statement section data
 */
export function useStatement(language?: string) {
  const { lang } = useLanguage();
  const activeLanguage = language ?? lang;
  
  return useQuery({
    queryKey: queryKeys.featured.statement(activeLanguage),
    queryFn: async () => {
      const normalizedLanguage = activeLanguage === 'ar' ? 'ar' : 'en';
      return featuredFetchers.fetchStatement(normalizedLanguage);
    },
    staleTime: CACHE_TIMES.FEATURED_STALE,
    gcTime: CACHE_TIMES.FEATURED_GC,
  });
}

