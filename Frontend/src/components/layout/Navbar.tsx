import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/ui/useTheme";
import { useNavigation } from "@/hooks/queries/useNavigationData";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "@/lib/core/constants";
import { Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui";
import { lazy, Suspense } from "react";
import { useLanguage } from "@/hooks/i18n/useLanguage";
import { usePrevious } from "@/hooks/common/usePrevious";
import { usePrefetch } from "@/hooks/performance";
import { NavbarHeader } from "./Navbar/NavbarHeader";
import { NavbarDesktopMenu } from "./Navbar/NavbarDesktopMenu";
import { NavbarUtilities } from "./Navbar/NavbarUtilities";
import { NavbarMobileMenu } from "./Navbar/NavbarMobileMenu";

const SearchModal = lazy(() => import("@/components/search/SearchModal").then(m => ({ default: m.SearchModal })));
const AuthModal = lazy(() => import("@/components/widgets/AuthModal").then(m => ({ default: m.AuthModal })));

/**
 * Main Navbar Component
 * Refactored to use smaller sub-components for better maintainability
 * 
 * Sub-components:
 * - NavbarHeader: Logo and branding
 * - NavbarDesktopMenu: Desktop navigation items
 * - NavbarUtilities: Search, language, theme, account buttons
 * - NavbarMobileMenu: Mobile navigation overlay
 */
export function Navbar() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { lang, isRTL } = useLanguage();
  const { data } = useNavigation();
  const { prefetchPage } = usePrefetch();

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const prevPathname = usePrevious(location.pathname);

  // Handle scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (prevPathname && prevPathname !== location.pathname && isMobileMenuOpen) {
      // Use setTimeout to avoid synchronous setState during render/effect cascade
      const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPathname, isMobileMenuOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const navItems = data?.navbar?.links || [];

  const handleNavClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
  }, []);

  const handleAuthOpen = useCallback(() => {
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <div className="h-20 lg:h-24" />
      <nav
        className={`fixed top-0 left-0 right-0 w-full border-b transition-all duration-300 ${
          isMobileMenuOpen ? "z-[130]" : "z-[100]"
        } ${
          isMobileMenuOpen || isScrolled
            ? "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm border-gray-100 dark:border-zinc-800"
            : "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-100/50 dark:border-zinc-800/50"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto max-w-7xl flex h-20 lg:h-24 items-center justify-between px-6 lg:px-12">
          {/* Left Side: Logo & Nav Items */}
          <div className="flex items-center gap-8 lg:gap-12">
            <NavbarHeader lang={lang} onClose={handleNavClick} />
            <NavbarDesktopMenu
              navItems={navItems}
              lang={lang}
              prefetchPage={prefetchPage}
            />
          </div>

          {/* Right Side: Utilities */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <NavbarUtilities
              lang={lang}
              theme={theme}
              onToggleTheme={toggleTheme}
              onSearchOpen={handleSearchOpen}
              onAuthOpen={handleAuthOpen}
            />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-starbucks-dark dark:text-foreground-dark rounded-full h-11 w-11 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
              aria-label={isMobileMenuOpen ? t("common:close_menu") : t("common:open_menu")}
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={ANIMATION_CONFIG.TRANSITIONS.QUICK as unknown as import("framer-motion").Transition}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <MenuIcon className="h-6 w-6" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-20 lg:top-24 z-[110] lg:hidden">
            <motion.div
              {...ANIMATION_CONFIG.VARIANTS.FADE_IN}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <NavbarMobileMenu
              ref={mobileMenuRef}
              navItems={navItems}
              lang={lang}
              isRTL={isRTL}
              onNavClick={handleNavClick}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Suspense fallback={null}>
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </Suspense>
      <Suspense fallback={null}>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </Suspense>
    </>
  );
}

