import { useTranslation } from "react-i18next";
import { SectionBackground } from "@/components/ui";
import { LoadingAnnouncement, LiveRegion } from "@/components/accessibility";
import { useFeaturedCards } from "@/hooks/queries/useFeaturedData";
import { useLanguage } from "@/hooks/i18n/useLanguage";
import { FeaturedCard } from "./FeaturedCard";

import defaultFeaturedCards from "@/data/home/featured-cards.json";

export function FeaturedCards() {
  const { t } = useTranslation(["pages", "common"]);
  const { lang } = useLanguage();

  // Fetch featured cards data using TanStack Query
  const { data: featuredCardsData, isLoading } = useFeaturedCards();

  // Show skeleton while loading
  if (isLoading) {
    return (
      <>
        <LoadingAnnouncement isLoading={true} />
        <FeaturedCardsSkeleton />
      </>
    );
  }

  const effectiveCardsData = featuredCardsData || defaultFeaturedCards;

  return (
    <section className="py-12 relative overflow-hidden bg-background transition-colors">
      <SectionBackground variant="default" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {effectiveCardsData?.cards?.map((card: { id: string; image: string; theme?: string; ctaLink?: string; secondaryCtaLink?: string; [key: string]: unknown }, index: number) => {
            const title = t(`pages:home.featured.${card.id}.title`);
            const description = t(`pages:home.featured.${card.id}.description`);
            const cta = t(`pages:home.featured.${card.id}.cta`) as string;
            const secondaryCta = t(`pages:home.featured.${card.id}.secondaryCta`, { defaultValue: "" }) as string;
            const imageAlt = t(`pages:home.featured.${card.id}.imageAlt`) as string;
            
            // Handle language-specific links if they exist in locales
            const localeLink = t(`pages:home.featured.${card.id}.ctaLink`, { defaultValue: "" }) as string;
            const ctaLink = localeLink || card.ctaLink;
            
            const secondaryLocaleLink = t(`pages:home.featured.${card.id}.secondaryCtaLink`, { defaultValue: "" }) as string;
            const secondaryCtaLink = secondaryLocaleLink || card.secondaryCtaLink;

            return (
              <FeaturedCard
                key={card.id}
                id={card.id}
                image={card.image}
                title={title}
                description={description}
                cta={cta}
                ctaLink={ctaLink || ""}
                secondaryCta={secondaryCta}
                secondaryCtaLink={secondaryCtaLink}
                imageAlt={imageAlt}
                theme={card.theme}
                index={index}
                lang={lang}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedCardsSkeleton() {
  return (
    <section className="py-12 relative overflow-hidden bg-background transition-colors">
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 shadow-lg flex flex-col ${
                // Medium screens: Last card (index 4) spans full width (2 columns)
                i === 4 ? "sm:col-span-2" : ""
              } ${
                // Large screens: First 3 cards span 2 columns each, last 2 cards span 3 columns each
                i <= 2 ? "lg:col-span-2" : "lg:col-span-3"
              }`}
            >
              {/* Image Skeleton */}
              <div className="h-64 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />

              {/* Content Skeleton */}
              <div className="flex flex-col flex-grow p-4">
                <div className="flex-grow">
                  <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 mx-auto" />
                  <div className="mb-2 h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 mx-auto" />
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
