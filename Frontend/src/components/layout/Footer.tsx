import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { useNavigation, useLanguage } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "@/lib/core/constants";

import { FooterLink, FooterSection, Country, Social } from "@/types";

export function Footer() {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  // Fetch footer structural data
  const { data: footerDataRaw } = useNavigation();
  // Extract footer specific config:
  const footerData = footerDataRaw?.footer || {
    sections: [],
    legal: [],
    app: { appStore: "", googlePlay: "" },
    socials: [],
    countries: [],
  };

  // Single unified state: only ONE accordion can ever be open at a time
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? null : id));
  };

  const socialIcons: Record<string, React.ReactNode> = {
    spotify: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    pinterest: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.223.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
    instagram: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12.525.02c1.31 0 2.59.34 3.72 1a6.49 6.49 0 0 1 3.57 5.1c0 .02 0 .04 0 .06a6.49 6.49 0 0 0-3.15-1.55v7.2a4.91 4.91 0 0 1-4.91 4.91 4.91 4.91 0 0 1-4.91-4.91 4.91 4.91 0 0 1 4.91-4.91c.21 0 .41.01.62.04v2.54a2.41 2.41 0 0 0-.62-.08 2.37 2.37 0 1 0 2.37 2.37v-12c0-.02 0-.04 0-.06.01-1.07.72-2.01 1.75-2.28a2.38 2.38 0 0 1 1.65.57 6.49 6.49 0 0 0 3.15 1.55c0-.2 0-.41 0-.62 0-1.33-.42-2.61-1.2-3.69A6.49 6.49 0 0 0 16.245.02h-3.72z" />
      </svg>
    ),
  };

  return (
    <footer className="bg-starbucks-dark pt-8 md:pt-16 pb-28 md:pb-12 text-white">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Desktop: Regular grid, Mobile: 2x2 grid with collapsible sections */}
        <div className="border-b border-white/10 pb-16">
          {/* Mobile: 2x2 Grid with Accordions */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {footerData.sections.map(
              (section: FooterSection, index: number) => {
                const accordionId = `section-${index}`;
                const isOpen = activeAccordion === accordionId;

                return (
                  <div
                    key={index}
                    className="border border-white/10 rounded-lg overflow-hidden self-start"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(accordionId)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                        {t(`navigation:footer.sections.${section.id}`)}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={ANIMATION_CONFIG.TRANSITIONS.QUICK_ROTATE as unknown as import("framer-motion").Transition}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-300" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={`content-${accordionId}`}
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={ANIMATION_CONFIG.VARIANTS.ACCORDION_EXPAND}
                          transition={ANIMATION_CONFIG.TRANSITIONS.SPRING}
                        >
                          <ul className="px-4 pb-4 space-y-3">
                            {section.links.map((link: FooterLink) => (
                              <li key={link.id}>
                                <Link
                                  to={`/${lang}${link.href}`}
                                  className="text-sm text-gray-300 hover:text-white transition-colors block"
                                >
                                  {t(`navigation:footer.links.${link.id}`)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              },
            )}

            {/* Location Selector as 4th item in grid */}
            <div className="border border-white/10 rounded-lg overflow-hidden self-start">
              <button
                type="button"
                onClick={() => toggleAccordion("location")}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                aria-expanded={activeAccordion === "location"}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-starbucks-green" />
                  <span className="text-sm font-extrabold uppercase tracking-wider text-white">
                    {t("common:locations")}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: activeAccordion === "location" ? 180 : 0 }}
                  transition={ANIMATION_CONFIG.TRANSITIONS.QUICK_ROTATE as unknown as import("framer-motion").Transition}
                >
                  <ChevronDown className="h-4 w-4 text-gray-300" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === "location" && (
                  <motion.div
                    key="content-location"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={ANIMATION_CONFIG.VARIANTS.ACCORDION_EXPAND}
                    transition={ANIMATION_CONFIG.TRANSITIONS.SPRING}
                  >
                    <div className="px-4 pb-4">
                      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-300">
                        {t("common:select_region")}
                      </div>
                      <div className="max-h-[200px] overflow-y-auto scrollbar-thin space-y-1">
                        {(footerData.countries as Country[]).map((country: Country) => (
                          <a
                            key={country.name}
                            href={country.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-starbucks-green transition-all"
                          >
                            {country.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop: Regular 4-column grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-12">
            {footerData.sections.map((section: FooterSection) => (
              <div key={section.id}>
                <h3 className="mb-6 text-lg font-extrabold uppercase tracking-widest text-white">
                  {t(`navigation:footer.sections.${section.id}`)}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link: FooterLink) => (
                    <li key={link.id}>
                      <Link
                        to={`/${lang}${link.href}`}
                        className="text-base text-gray-300 hover:text-white transition-colors"
                      >
                        {t(`navigation:footer.links.${link.id}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Location Selector - Desktop Only */}
            <div>
              <h3 className="mb-6 text-lg font-extrabold uppercase tracking-widest text-white">
                {t("common:egypt")}
              </h3>
              <div className="group relative inline-block">
                <button className="flex items-center gap-3 text-base text-gray-300 hover:text-white transition-colors cursor-pointer py-2">
                  <Globe className="h-5 w-5 text-starbucks-green" />
                  <span className="font-bold underline decoration-white/20 underline-offset-8 group-hover:decoration-starbucks-green transition-all">
                    {t("common:egypt")}
                  </span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div className="invisible absolute bottom-[calc(100%+12px)] inset-inline-start-0 z-50 w-80 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl transition-all opacity-0 scale-95 origin-bottom-start group-hover:visible group-hover:opacity-100 group-hover:scale-100 overflow-hidden">
                  <div className="h-[300px] overflow-y-auto scrollbar-thin rtl">
                    <div className="p-5 px-6">
                      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-300">
                        {t("common:select_region")}
                      </div>
                      <ul className="space-y-1">
                        {(footerData.countries as Country[]).map((country: Country) => (
                          <li key={country.name}>
                            <a
                              href={country.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-starbucks-green transition-all"
                            >
                              {country.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Socials, Legal and App */}
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6 justify-between">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              {footerData.legal.map((link: FooterLink) => {
                const linkText = t(`navigation:footer.links.${link.id}`);
                const isCookieSettings = link.id === "cookie_notice";

                if (isCookieSettings) {
                  return (
                    <button
                      key={link.id}
                      onClick={() =>
                        window.dispatchEvent(new Event("openCookieSettings"))
                      }
                      className="text-base font-bold text-gray-300 hover:text-white transition-colors text-start cursor-pointer"
                    >
                      {linkText}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.id}
                    to={`/${lang}${link.href}`}
                    className="text-base font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    {linkText}
                  </Link>
                );
              })}
            </div>

            {/* Starbucks Brief Description */}
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>{t("navigation:footer.description")}</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6">
              {footerData.socials.map((social: Social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-all transform hover:scale-110"
                >
                  {socialIcons[social.name]}
                </a>
              ))}
            </div>
          </div>

          {/* App Download Card */}
          <div className="flex justify-end lg:justify-end">
            <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10 h-full flex flex-col justify-between">
              <div>
                <h4 className="mb-3 text-xl font-extrabold text-white">
                  {t("navigation:footer.app.title")}
                </h4>
                <p className="mb-8 text-base text-gray-300">
                  {t("navigation:footer.app.description")}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#"
                  className="flex h-12 items-center gap-3 rounded-lg border border-white/20 bg-black px-5 transition-all hover:bg-white/5"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.46-2.23-.46-3.38 0-1.02.48-2.02.42-2.91-.42C5.98 18.04 4.28 12.57 6.82 7.85c1.23-2.17 3.41-3.41 5.61-3.41 1.1 0 2.15.25 3 .75 1.28.75 2.76.75 4.04 0 .95-.5 2-.8 3.1-.75 1.55.05 2.85.7 3.65 1.85-3.35 1.95-2.8 6.35.55 7.8-.8 2-1.95 3.95-3.55 5.55-.98.95-2.05.88-3.08.4-1.09-.46-2.23-.46-3.38 0-.98.48-2.02.42-2.91-.42zM12 4.45c-.1-2.2 1.8-4.2 4.2-4.2.1 2.2-1.8 4.2-4.2 4.2z" />
                  </svg>
                  <div className="text-start">
                    <div className="text-[10px] uppercase leading-none text-gray-300">
                      {t("navigation:footer.app.app_store").split(" ")[0]}
                    </div>
                    <div className="text-sm font-bold leading-tight">
                      {t("navigation:footer.app.app_store").split(" ").slice(1).join(" ")}
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex h-12 items-center gap-3 rounded-lg border border-white/20 bg-black px-5 transition-all hover:bg-white/5"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3.609 1.814L13.792 12 3.609 22.186A.996.996 0 013.2 21.372V2.628c0-.34.17-.65.409-.814zm10.591 10.186l2.84 2.84-11.01 6.124 8.17-8.964zm2.84-2.84l-2.84 2.84 8.17-8.964-11.01 6.124 5.68 0zm.362 1.394l4.617-2.556c.362-.2.594-.611.594-1.074 0-.463-.232-.873-.594-1.074L17.402 3.294c-.362-.2-.826-.2-1.188 0L3.609 10.186 13.792 12l3.61-1.446z" />
                  </svg>
                  <div className="text-start">
                    <div className="text-[10px] uppercase leading-none text-gray-300">
                      {t("navigation:footer.app.google_play")
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </div>
                    <div className="text-sm font-bold leading-tight">
                      {t("navigation:footer.app.google_play").split(" ").slice(2).join(" ")}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 pb-4 text-center text-[13px] text-gray-300 border-t border-white/10 px-4 md:px-24">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <p>
              © {new Date().getFullYear()} Starbucks Coffee Company.{" "}
              {t("common:all_rights_reserved")}
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>{t("navigation:footer.designed_by")}</span>
              <a
                href="https://m-said-portfolio.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-300 hover:text-white transition-colors no-underline"
              >
                M.Said
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

