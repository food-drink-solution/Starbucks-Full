import { useTranslation } from "react-i18next";

import { Banner } from "@/components/ui/banner";
import { StatementSection } from "@/components/sections/StatementSection";
import { FeaturedCards } from "@/components/sections/FeaturedCards";
import { SEO } from "@/components/layout/SEO";
import { QueryErrorBoundary } from "@/components/error/QueryErrorBoundary";
import { LoadingAnnouncement } from "@/components/accessibility";
import { HomeSkeleton } from "@/components/skeletons";
import { useLanguage } from "@/hooks/i18n/useLanguage";
import { useHero } from "@/hooks/queries/useFeaturedData";

interface HeroData {
  ctaLink: string;
  imageUrl: string;
  secondaryImageUrls?: { ar?: string; en?: string };
  [key: string]: unknown;
}

const HomePageContent: React.FC<{ heroData: HeroData }> = ({ heroData }) => {
  const { lang } = useLanguage();
  const { t } = useTranslation(["common", "errors", "pages"]);
  const pageTitle = lang === "ar" ? "ستاربكس مصر" : "Starbucks Egypt";

  return (
    <div className="flex flex-col">
      <SEO title={pageTitle} />
      <Banner
        title={t("pages:home.hero.title")}
        description={t("pages:home.hero.description")}
        ctaText={t("pages:home.hero.ctaText")}
        ctaLink={heroData.ctaLink}
        imageUrl={heroData.imageUrl}
        secondaryImageUrl={heroData.secondaryImageUrls?.[lang]}
        imageAlt={t("pages:home.hero.imageAlt")}
        isRTL={lang === "ar"}
      />

      <div className="relative z-20 -mt-16 h-32 pointer-events-none">
        <div
          className="absolute inset-0 backdrop-blur-[10px]"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black 40%, black)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 40%, black)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      <StatementSection />
      <FeaturedCards />
    </div>
  );
};

export const HomePage = () => {
  const { data: heroData, isLoading } = useHero();

  if (isLoading) {
    return (
      <>
        <LoadingAnnouncement isLoading={true} />
        <HomeSkeleton />
      </>
    );
  }

  return (
    <QueryErrorBoundary>
      {heroData && <HomePageContent heroData={heroData as HeroData} />}
    </QueryErrorBoundary>
  );
};

export default HomePage;
