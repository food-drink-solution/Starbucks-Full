/**
 * React Query Key Factory
 * Centralized query key management for type-safe cache invalidation
 */

export const queryKeys = {
  all: () => ['query'] as const,
  
  // Auth queries
  auth: {
    all: () => ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    profile: () => ['auth', 'profile'] as const,
    status: () => ['auth', 'status'] as const,
  },

  // Menu queries
  menu: {
    all: () => ['menu'] as const,
    items: () => ['menu', 'items'] as const,
    item: (id: string) => ['menu', 'items', id] as const,
    byItem: (categoryId: string, itemId: string) => ['menu', 'byItem', categoryId, itemId] as const,
    categories: () => ['menu', 'categories'] as const,
    category: (id: string) => ['menu', 'categories', id] as const,
    byCategory: (id: string) => ['menu', 'byCategory', id] as const,
    search: (query: string) => ['menu', 'search', query] as const,
  },

  // Location queries
  locations: {
    all: () => ['locations'] as const,
    list: () => ['locations', 'list'] as const,
    detail: (id: string) => ['locations', id] as const,
    nearby: (lat: number, lng: number) => ['locations', 'nearby', lat, lng] as const,
    byCity: (city: string) => ['locations', 'byCity', city] as const,
    byRegion: (region: string) => ['locations', 'byRegion', region] as const,
  },

  // Order queries
  orders: {
    all: () => ['orders'] as const,
    list: () => ['orders', 'list'] as const,
    detail: (id: string) => ['orders', id] as const,
    history: () => ['orders', 'history'] as const,
  },

  // User queries
  user: {
    all: () => ['user'] as const,
    profile: () => ['user', 'profile'] as const,
    preferences: () => ['user', 'preferences'] as const,
  },

  // Page data queries
  pages: {
    all: () => ['pages'] as const,
    detail: (slug: string) => ['pages', 'detail', slug] as const,
    bySlug: (slug: string) => ['pages', 'bySlug', slug] as const,
  },

  // Cart queries
  cart: {
    all: () => ['cart'] as const,
    items: () => ['cart', 'items'] as const,
  },

  // Navigation queries
  navigation: {
    all: () => ['navigation'] as const,
    config: () => ['navigation', 'config'] as const,
  },

  // Featured queries
  featured: {
    all: () => ['featured'] as const,
    cards: (language?: string) => ['featured', 'cards', language] as const,
    hero: (language?: string) => ['featured', 'hero', language] as const,
    statement: (language?: string) => ['featured', 'statement', language] as const,
  },

  // Contact queries
  contact: {
    all: (language?: string) => ['contact', language] as const,
  },

  // Admin queries
  admin: {
    all: () => ['admin'] as const,
    categories: () => ['admin', 'categories'] as const,
    menuItems: () => ['admin', 'menuItems'] as const,
    users: () => ['admin', 'users'] as const,
    moderation: () => ['admin', 'moderation'] as const,
    pendingContent: () => ['admin', 'pendingContent'] as const,
    moderationStats: () => ['admin', 'moderationStats'] as const,
    dashboardStats: () => ['admin', 'dashboardStats'] as const,
    salesAnalytics: (startDate: string, endDate: string) => ['admin', 'salesAnalytics', startDate, endDate] as const,
    userAnalytics: (startDate: string, endDate: string) => ['admin', 'userAnalytics', startDate, endDate] as const,
    orderAnalytics: (startDate: string, endDate: string) => ['admin', 'orderAnalytics', startDate, endDate] as const,
    locationPerformance: () => ['admin', 'locationPerformance'] as const,
    menuItemPopularity: () => ['admin', 'menuItemPopularity'] as const,
    systemHealth: () => ['admin', 'systemHealth'] as const,
  },
};
