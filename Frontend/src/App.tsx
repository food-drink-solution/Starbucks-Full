import { Suspense, useLayoutEffect, useEffect, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/queryClient";
import { ANIMATION_CONFIG } from "@/lib/core/constants";
import { loadPageTranslations, getPageSlug } from "@/lib/i18n/pageTranslations";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { SkipNav } from "@/components/ui/skip-nav";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import ErrorProvider from "@/contexts/ErrorContext";
import { REDIRECT_ROUTES, PAGE_ROUTES } from "@/config/routes";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    )
  : null;

const PageWrapper = ({
  children,
  skeleton,
}: {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}) => (
  <motion.div
    {...ANIMATION_CONFIG.VARIANTS.FADE_IN}
    transition={{ duration: ANIMATION_CONFIG.DURATION_SEC.SLOW, ease: "easeInOut" }}
  >
    <Suspense fallback={skeleton || <div className="min-h-screen bg-background" />}>
      {children}
    </Suspense>
  </motion.div>
);

const TranslationLoader = () => {
  const location = useLocation();
  useEffect(() => {
    const slug = getPageSlug(location.pathname);
    loadPageTranslations("ar", slug);
    loadPageTranslations("en", slug);
  }, [location.pathname]);
  return null;
};

const LanguageDirectionHandler = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  useLayoutEffect(() => {
    if (lang === "ar" || lang === "en") {
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", lang);
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  return null;
};

const MenuRedirect = () => {
  const { categoryId, itemId } = useParams<{ categoryId?: string; itemId?: string }>();
  if (itemId) return <Navigate to={`/ar/menu/${categoryId}/${itemId}`} replace />;
  if (categoryId) return <Navigate to={`/ar/menu/${categoryId}`} replace />;
  return <Navigate to="/ar/menu" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div>
      <TranslationLoader />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {REDIRECT_ROUTES.map((route) => (
            <Route key={route.from} path={route.from} element={<Navigate to={route.to} replace />} />
          ))}
          <Route path="/menu" element={<MenuRedirect />} />
          <Route path="/menu/:categoryId" element={<MenuRedirect />} />
          <Route path="/menu/:categoryId/:itemId" element={<MenuRedirect />} />
          <Route
            path="/:lang"
            element={
              <div>
                <LanguageDirectionHandler />
                <MainLayout />
              </div>
            }
          >
            {PAGE_ROUTES.map((route) => {
              const Component = route.component;
              const SkeletonComponent = route.skeleton;
              return (
                <Route
                  key={route.name}
                  path={route.path}
                  element={
                    <PageWrapper skeleton={<SkeletonComponent />}>
                      {route.props ? <Component {...route.props} /> : <Component />}
                    </PageWrapper>
                  }
                />
              );
            })}
            <Route path="account" element={<Navigate to="profile" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ErrorBoundary>
          <Router>
            <SkipNav />
            <div id="main-content" />
            <AnimatedRoutes />
            <OfflineIndicator />
          </Router>
        </ErrorBoundary>
      </ErrorProvider>
      {import.meta.env.DEV && ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

export default App;
