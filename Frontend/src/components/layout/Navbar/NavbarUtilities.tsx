import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MapPin, Search, Moon, Sun, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Tooltip } from "@/components/ui";
import { CartTrigger } from "@/components/widgets/CartDrawer";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLanguage } from "@/hooks/i18n/useLanguage";
import type { Language } from "@/hooks/i18n/useLanguage";
import { ANIMATION_CONFIG } from "@/lib/core/constants";
import { Theme } from "@/types";

interface NavbarUtilitiesProps {
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
  onSearchOpen: () => void;
  onAuthOpen: () => void;
}

/**
 * Navbar Utilities Component
 * Displays location, search, language, theme, and account buttons
 * ~100 LOC
 */
export function NavbarUtilities({
  lang,
  theme,
  onToggleTheme,
  onSearchOpen,
  onAuthOpen,
}: NavbarUtilitiesProps) {
  const { t } = useTranslation(["common", "navigation"]);
  const { toggleLanguage } = useLanguage();

  const { isAuthenticated } = useAuth();

  return (
    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
      {/* Location Button */}
      <Tooltip
        content={t("navigation:navbar.tooltips.locations")}
        className="w-11 h-11"
      >
        <NavLink
          to={`/${lang}/locations`}
          aria-label={t("navigation:navbar.tooltips.locations")}
          className={({ isActive }) => `
            group flex items-center justify-center h-11 w-11 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green
            ${isActive ? "text-starbucks-green" : "text-starbucks-dark hover:text-starbucks-green dark:text-foreground-dark"}
          `}
        >
          <MapPin className="h-5 w-5" />
        </NavLink>
      </Tooltip>

      {/* Search Button */}
      <Tooltip
        content={t("common:search")}
        className="w-11 h-11"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchOpen}
          className="rounded-full h-11 w-11 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
          aria-label={t("common:search")}
        >
          <Search className="h-5 w-5" />
        </Button>
      </Tooltip>

      {/* Language Toggle */}
      <Tooltip
        content={t("navigation:navbar.tooltips.language")}
        className="w-11 h-11"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleLanguage()}
          className="group relative flex items-center justify-center font-bold text-starbucks-dark dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full h-11 w-11 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
          aria-label={`${lang === "ar" ? "EN" : "AR"} ${t("navigation:navbar.tooltips.language")}`}
        >
          <span className="text-sm font-black uppercase tracking-tighter">
            {lang === "ar" ? "EN" : "AR"}
          </span>
        </Button>
      </Tooltip>

      {/* Theme Toggle */}
      <Tooltip
        content={
          theme === "dark"
            ? t("navigation:navbar.tooltips.light_mode")
            : t("navigation:navbar.tooltips.dark_mode")
        }
        className="w-11 h-11"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-starbucks-dark dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full h-11 w-11 transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
          aria-label={
            theme === "dark"
              ? t("navigation:navbar.tooltips.light_mode")
              : t("navigation:navbar.tooltips.dark_mode")
          }
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === "dark" ? 180 : 0 }}
            transition={ANIMATION_CONFIG.TRANSITIONS.QUICK_ROTATE as unknown as import("framer-motion").Transition}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </Tooltip>

      {/* Account Button */}
      <Tooltip
        content={t("navigation:navbar.tooltips.account")}
        className="w-11 h-11"
      >
        {isAuthenticated ? (
          <Link
            to={`/${lang}/account/profile`}
            className="flex items-center justify-center text-starbucks-dark dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full h-11 w-11 transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-starbucks-green/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
            aria-label={t("navigation:navbar.tooltips.account")}
          >
            <User className="h-5 w-5" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAuthOpen}
            className="text-starbucks-dark dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full h-11 w-11 transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-starbucks-green/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
            aria-label={t("navigation:navbar.tooltips.account")}
            data-testid="auth-trigger-button"
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </Tooltip>

      {/* Cart Drawer */}
      <Tooltip
        content={t("common:cart.title")}
        className="w-11 h-11"
      >
        <div className="flex items-center justify-center">
          <CartTrigger />
        </div>
      </Tooltip>
    </div>
  );
}

