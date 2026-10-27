import { lazy, ComponentType } from 'react';
import { HomeSkeleton, MenuSkeleton, StaticPageSkeleton, ContactSkeleton, LocationsSkeleton } from '@/components/skeletons';


/**
 * Route configuration type
 */
export interface PageRoute {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any> | React.LazyExoticComponent<ComponentType<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skeleton: ComponentType<any>;
  name: string;
  props?: Record<string, unknown>;
}

// Lazy loaded Pages for performance
const ContactUsPage = lazy(() => import('@/pages/ContactUsPage/ContactUsPage').then((module) => ({ default: module.ContactUsPage })));

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage }))
);

const MenuPage = lazy(() =>
  import('@/pages/MenuPage').then((module) => ({ default: module.MenuPage }))
);

const MenuCategoryPage = lazy(() =>
  import('@/pages/MenuCategoryPage').then((module) => ({
    default: module.MenuCategoryPage,
  }))
);

const MenuItemPage = lazy(() =>
  import('@/pages/MenuItemPage').then((module) => ({
    default: module.MenuItemPage,
  }))
);

const LocationsPage = lazy(() =>
  import('@/pages/LocationsPage').then((module) => ({
    default: module.LocationsPage,
  }))
);

const CheckoutPage = lazy(() =>
  import('@/pages/CheckoutPage/CheckoutPage').then((module) => ({ default: module.CheckoutPage }))
);

const OrderConfirmationPage = lazy(() =>
  import('@/pages/OrderConfirmationPage/OrderConfirmationPage').then((module) => ({ default: module.OrderConfirmationPage }))
);

const PaymentSuccessPage = lazy(() =>
  import('@/pages/PaymentSuccessPage/PaymentSuccessPage').then((module) => ({ default: module.PaymentSuccessPage }))
);

const PaymentFailedPage = lazy(() =>
  import('@/pages/PaymentFailedPage/PaymentFailedPage').then((module) => ({ default: module.PaymentFailedPage }))
);

const NotFound = lazy(() =>
  import('@/pages/NotFound/NotFound').then((module) => ({ default: module.NotFound }))
);

/**
 * Route redirect mappings
 * Maps old routes to new language-prefixed routes
 */
export const REDIRECT_ROUTES = [
  { from: '/', to: '/ar' },
  { from: '/locations', to: '/ar/locations' },
  { from: '/contact-us', to: '/ar/contact-us' },
];

/**
 * Menu redirect routes
 */
export const MENU_REDIRECT_ROUTES = [
  { from: '/menu', to: '/ar/menu' },
  { from: '/menu/:categoryId', to: '/ar/menu/:categoryId' },
  { from: '/menu/:categoryId/:itemId', to: '/ar/menu/:categoryId/:itemId' },
];

/**
 * Page route configuration
 * Client-facing routes only - Admin pages managed in Dashboard
 */
export const PAGE_ROUTES: PageRoute[] = [
  {
    path: '',
    component: HomePage,
    skeleton: HomeSkeleton,
    name: 'home',
  },
  {
    path: 'menu',
    component: MenuPage,
    skeleton: MenuSkeleton,
    name: 'menu',
  },
  {
    path: 'menu/:categoryId',
    component: MenuCategoryPage,
    skeleton: MenuSkeleton,
    name: 'menu-category',
  },
  {
    path: 'menu/:categoryId/:itemId',
    component: MenuItemPage,
    skeleton: MenuSkeleton,
    name: 'menu-item',
  },
  {
    path: 'locations',
    component: LocationsPage,
    skeleton: LocationsSkeleton,
    name: 'locations',
  },
  {
    path: 'contact-us',
    component: ContactUsPage,
    skeleton: ContactSkeleton,
    name: 'contact',
  },
  {
    path: 'checkout',
    component: CheckoutPage,
    skeleton: StaticPageSkeleton,
    name: 'checkout',
  },
  {
    path: 'order/:orderId',
    component: OrderConfirmationPage,
    skeleton: StaticPageSkeleton,
    name: 'order-confirmation',
  },
  {
    path: 'payment/success',
    component: PaymentSuccessPage,
    skeleton: StaticPageSkeleton,
    name: 'payment-success',
  },
  {
    path: 'payment/failed',
    component: PaymentFailedPage,
    skeleton: StaticPageSkeleton,
    name: 'payment-failed',
  },
  {
    path: '*',
    component: NotFound,
    skeleton: StaticPageSkeleton,
    name: 'not-found',
  },
];
