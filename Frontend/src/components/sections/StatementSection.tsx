import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Link } from "react-router-dom";
import { useStatement } from "@/hooks/queries/useFeaturedData";
import { useLanguage } from "@/hooks/i18n/useLanguage";
import { ANIMATION_CONFIG } from '@/lib/core/constants';


const StatementSection = () => {
  const { t } = useTranslation(["pages", "common"]);
  const { lang } = useLanguage();

  // Fetch statement data using TanStack Query
  const { data: statementData, isLoading, error } = useStatement();

  // Show loading state (minimal skeleton)
  if (isLoading) {
    return (
      <section className="bg-background py-16 transition-colors">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center space-y-4">
            <div className="h-10 w-3/4 mx-auto animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-1/2 mx-auto animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-5/6 mx-auto animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-32 mx-auto animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </section>
    );
  }

  // Show error state (minimal fallback)
  if (error || !statementData) {
    return null; // Gracefully hide section if data fails to load
  }

  // Paragraphs are stored as an array in pages.json
  const paragraphs = t("pages:home.statement.paragraphs", { returnObjects: true }) as string[];

  return (
    <section className="bg-background py-16 transition-colors">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={ANIMATION_CONFIG.VARIANTS.SLIDE_UP.initial}
          whileInView={ANIMATION_CONFIG.VARIANTS.SLIDE_UP.animate}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="mb-6 text-3xl font-bold text-starbucks-dark dark:text-foreground-dark md:text-4xl transition-colors">
            {t("pages:home.statement.title")}
          </h2>
          <div className="mb-8 space-y-4 text-center">
            <h3 className="text-xl font-semibold text-starbucks-green">
              {t("pages:home.statement.subtitle")}
            </h3>
            {Array.isArray(paragraphs) && paragraphs.map(
              (paragraph: string, index: number) => (
                <p
                  key={index}
                  className="leading-relaxed text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {paragraph}
                </p>
              ),
            )}
          </div>
          <Link to={`/${lang}${statementData.ctaLink}`}>
            <Button variant="outline" size="lg">
              {t("pages:home.statement.ctaText")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export { StatementSection };
export default StatementSection;
