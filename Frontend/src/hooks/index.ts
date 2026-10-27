// Localization hooks
export { useResources, useResourceModule, useResourcesHealth, getLocalizedText } from './useResources';
export type { ResourcesResponse, ModuleResponse, HealthResponse } from './useResources';

export { useLocalization, useCommonResources, useTranslation } from './useLocalization';

// i18n hooks
export { useLanguage } from './i18n/useLanguage';
export type { Language, UseLanguageReturn } from './i18n/useLanguage';

// UI hooks
export { useTheme } from './ui/useTheme';
export { useAccordion } from './ui/useAccordion';

// Common hooks
export { usePrevious } from './common/usePrevious';
export { useInitialLoad, useStaleWhileRevalidate, useOptimisticUpdate, useRetryWithBackoff } from './common/useInitialLoad';

// Business logic hooks
export { useCart } from './business/useCart';
export { useOptimisticOrder } from './business/useOptimisticOrder';
export { usePayment } from './business/usePayment';

// Auth hooks
export { useAuth } from './auth/useAuth';

// Accessibility hooks
export { useAnnounce } from './accessibility/useAnnounce';
export { useFocusManagement } from './accessibility/useFocusManagement';
export { useKeyboardNavigation, useFocusTrap, useArrowKeyNavigation } from './accessibility/useKeyboardNavigation';
export type { KeyboardNavigationOptions } from './accessibility/useKeyboardNavigation';

// Query hooks
export { useMenuData, useMenuCategory, useMenuItem } from './queries/useMenuData';
export { useContactInfo } from './queries/useContactData';
export { useFeaturedCards, useHero, useStatement } from './queries/useFeaturedData';
export { useLocations } from './queries/useLocationData';
export { usePageData } from './queries/usePageData';
export { useNavigation } from './queries/useNavigationData';
