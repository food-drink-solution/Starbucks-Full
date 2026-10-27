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
import { useMenuData, useMenuItem, useLanguage } from "@/hooks";
import { MenuItem } from "@/types";

import { QueryErrorBoundary } from "@/components";

const MenuItemContent = () => {
  const { categoryId, itemId: subcategoryId } = useParams<{
    categoryId: string;
    itemId: string;
  }>();
  const { t } = useTranslation(["pages", "common"]);
  const { lang, isRTL } = useLanguage();

  const { data: menuData, isLoading: isMenuLoading } = useMenuData();
  const {
    data: itemData,
    isLoading: isItemLoading,
  } = useMenuItem(categoryId || "", subcategoryId || "");

  const isLoading = isMenuLoading || isItemLoading;

  if (isLoading) {
    return <MenuSkeleton />;
  }

  if (!itemData || !menuData) {
    return <NotFound />;
  }

  const { category, subcategory } = itemData;
  const categoryKey = `pages:menu.categories.${category.id}`;
  const subcategoryKey = `${categoryKey}.subcategories.${subcategory.id}`;
  
  const categoryTitle = t(`${categoryKey}.title`) || category.id;
  const subcategoryTitle = t(`${subcategoryKey}.title`) || subcategory.id;

  const textAlignClass = isRTL ? "text-right" : "text-left";

  return (
    <div
      className="bg-white dark:bg-background-dark min-h-screen"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SEO
        title={`${subcategoryTitle} - ${categoryTitle} - ${t("pages:menu.title")}`}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <SidebarTemplate
          image={subcategory.image || menuData.sidebar?.image || ""}
          title={subcategoryTitle}
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
              {subcategoryTitle}
            </h1>
          </div>

          {/* Items Grid - Matches MenuPage Grid Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full mb-16">
            {subcategory.items?.map((item: MenuItem, index: number) => {
              const itemKey = `${subcategoryKey}.items.${item.id}`;
              const itemTitle = t(`${itemKey}.title`) || item.id;
              const itemDesc = t(`${itemKey}.description`);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-zinc-800 group"
                >
                  <div className="relative h-56 overflow-hidden bg-starbucks-dark/5">
                    <img
                      src={item.image}
                      alt={itemTitle}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-1 items-center text-center">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                      {itemTitle}
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-8 flex-1 leading-relaxed">
                      {itemDesc}
                    </p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center justify-center px-8 py-3 border-2 border-starbucks-green text-starbucks-green font-black rounded-full group-hover:bg-starbucks-green group-hover:text-white transition-all transform group-hover:scale-105"
                    >
                      {t("common:order_delivery")}
                    </a>
                  </div>
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

export const MenuItemPage = () => {
  return (
    <QueryErrorBoundary>
      <MenuItemContent />
    </QueryErrorBoundary>
  );
};

export default MenuItemPage;



