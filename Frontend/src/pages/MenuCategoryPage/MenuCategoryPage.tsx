import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  SEO,
  AllergyInfo,
  MenuPromoVideo,
  SidebarTemplate
} from "@/components";
import { MenuSkeleton } from "@/components/skeletons";
import { NotFound } from "@/pages/NotFound/NotFound";
import { useMenuData, useMenuCategory, useLanguage } from "@/hooks";

import { QueryErrorBoundary } from "@/components";

const MenuCategoryContent = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { t } = useTranslation(["pages", "common"]);
  const { lang, isRTL } = useLanguage();
  const textAlignClass = isRTL ? "text-right" : "text-left";

  const { data: menuData, isLoading: isMenuLoading } = useMenuData();
  const {
    data: category,
    isLoading: isCategoryLoading,
  } = useMenuCategory(categoryId || "");

  const isLoading = isMenuLoading || isCategoryLoading;

  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (!category || !menuData) {
    return <NotFound />;
  }

  // Define translation keys for category
  const categoryKey = `pages:menu.categories.${category.id}`;
  const categoryTitle = t(`${categoryKey}.title`) || category.id;
  const categoryDesc = t(`${categoryKey}.description`);
  const categorySidebarTitle = t(`${categoryKey}.sidebarTitle`) || t("pages:menu.sidebar.title");

  return (
    <div
      className="bg-white dark:bg-background-dark min-h-screen"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SEO title={`${categoryTitle} - ${t("pages:menu.title")}`} />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <SidebarTemplate
          image={category.image || menuData.sidebar?.image || ""}
          title={categorySidebarTitle}
          overlay={
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Link
                to={t("pages:menu.order_url")}
                className="w-full py-4 px-6 rounded-full font-black text-lg transition-all shadow-xl bg-white text-gray-900 hover:bg-gray-100 scale-105 hover:scale-110"
              >
                {t("pages:menu.sidebar.actions.order")}
              </Link>
              <Link
                to={`/${lang}/locations`}
                className="w-full py-4 px-6 rounded-full font-black text-lg transition-all shadow-xl border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                {t("pages:menu.sidebar.actions.stores")}
              </Link>
            </div>
          }
        >
          {/* Side 2: Content Column */}
          <div className={`mb-12 ${textAlignClass}`}>
            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              {categoryTitle}
            </h1>
            <p className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap max-w-3xl">
              {categoryDesc}
            </p>
          </div>

          {/* Subcategories Grid - Matches MenuPage Grid Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full mb-16">
            {category.subcategories?.map((sub, index: number) => {
              const subTitle = t(`${categoryKey}.subcategories.${sub.id}.title`) || sub.id;
              const subDesc = t(`${categoryKey}.subcategories.${sub.id}.description`, { defaultValue: "" });
              
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-zinc-800 group"
                >
                  <Link
                    to={`/${lang}${sub.href}`}
                    className="flex flex-col h-full"
                  >
                    <div className="relative h-56 overflow-hidden bg-starbucks-dark/5">
                      <img
                        src={sub.image}
                        alt={subTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-1 items-center text-center">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                        {subTitle}
                      </h2>
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-8 flex-1 leading-relaxed">
                        {subDesc}
                      </p>
                      <span className="mt-auto inline-flex items-center justify-center px-8 py-3 border-2 border-starbucks-green text-starbucks-green font-black rounded-full group-hover:bg-starbucks-green group-hover:text-white transition-all transform group-hover:scale-105">
                        {t("common:discover_more")}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Promo Video */}
          <div className="mb-20">
            <MenuPromoVideo />
          </div>

          {/* Allergy Info */}
          {menuData.allergyInfo && (
            <AllergyInfo
              title={t("pages:menu.allergyInfo.title")}
              description={t("pages:menu.allergyInfo.description")}
              link={menuData.allergyInfo.link}
              linkLabel={t("pages:menu.allergyInfo.linkLabel")}
            />
          )}
        </SidebarTemplate>
      </div>
    </div>
  );
};

export const MenuCategoryPage = () => {
  return (
    <QueryErrorBoundary>
      <MenuCategoryContent />
    </QueryErrorBoundary>
  );
};

export default MenuCategoryPage;



