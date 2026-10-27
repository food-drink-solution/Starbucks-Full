import { useLanguage } from "@/hooks/i18n/useLanguage";

export const SkipNav = () => {
  const { isRTL } = useLanguage();

  return (
    <a
      href="#main-content"
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:z-50
        bg-starbucks-green text-white px-6 py-3 rounded-full font-bold
        transition-all duration-300
        ${isRTL ? "focus:right-4" : "focus:left-4"}
      `}
    >
      {isRTL ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content"}
    </a>
  );
};
