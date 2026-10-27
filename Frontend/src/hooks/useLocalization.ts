import { useResources, useResourceModule } from './useResources';
import { useLanguage } from './i18n/useLanguage';

/**
 * Combined hook for localization
 * Fetches resources and applies language context
 * 
 * Usage:
 * const { resources, loading, error } = useLocalization('menu');
 * const title = resources?.title;
 */
export function useLocalization(module?: string) {
  const { lang } = useLanguage();

  // Get all resources or specific module
  const allResources = useResources(lang);
  const specificModule = useResourceModule(lang, module ?? 'common', Boolean(module));

  if (module) {
    return {
      resources: specificModule.data?.resources,
      loading: specificModule.isLoading,
      error: specificModule.error,
      isError: specificModule.isError,
    };
  }

  return {
    resources: allResources.data?.modules,
    loading: allResources.isLoading,
    error: allResources.error,
    isError: allResources.isError,
  };
}

/**
 * Convenience hook to get common UI text
 * 
 * Usage:
 * const common = useCommonResources();
 * return <button>{common.save}</button>;
 */
export function useCommonResources() {
  const { resources, loading } = useLocalization('common');
  const general = resources?.general;

  return {
    ...(general && typeof general === 'object' ? general : {}),
    loading,
  };
}

/**
 * Get deeply nested translation value
 * 
 * Usage:
 * const text = useTranslation('menu.categories.drinks.title');
 */
export function useTranslation(path: string) {
  const { lang } = useLanguage();
  const { data } = useResources(lang);

  if (!data) return '';

  const keys = path.split('.');
  let value: unknown = data.modules;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
}
