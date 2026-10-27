import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { contactFetchers } from "@/lib/api";
import { CACHE_TIMES } from "@/lib/core/constants";
import { useLanguage } from "@/hooks/i18n/useLanguage";

/**
 * Hook to fetch contact information
 *
 * Cache Strategy:
 * - Stale Time: 24 hours (rarely changes)
 * - GC Time: 48 hours
 */
export function useContactInfo(language?: string) {
  const { lang } = useLanguage();
  const activeLanguage = language ?? lang;
  
  return useQuery({
    queryKey: queryKeys.contact.all(activeLanguage),
    queryFn: async () => {
      const normalizedLanguage = activeLanguage === 'ar' ? 'ar' : 'en';
      return contactFetchers.fetchContactInfo(normalizedLanguage);
    },
    staleTime: CACHE_TIMES.PAGE_STALE,
    gcTime: CACHE_TIMES.PAGE_GC,
  });
}

