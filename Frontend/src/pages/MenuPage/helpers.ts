import type { MenuCategory } from "@/types";
import type { LocalizedContent } from "@/lib/schemas";
import type { FlatItem } from "./types";

/**
 * Flattens all nested category → subcategory → item
 * structures into a single array of FlatItem objects.
 * 
 * Now converts LocalizedContent fields (from API) into the FlatItem shape
 * without any language-specific field switching — components receive
 * the full { English, Arabic } object and decide what to display.
 */
/**
 * Normalizes a localized value coming from the API. The API serializes
 * localized content with lowercase keys ({ english, arabic }), while the
 * internal LocalizedContent type uses capitalized keys ({ English, Arabic }).
 */
function toLocalized(raw: unknown): LocalizedContent {
  const o = raw as Record<string, unknown> | undefined;

  if (!o || typeof o !== "object") {
    return { English: "", Arabic: "" };
  }

  return {
    English: String(o.English ?? o.english ?? ""),
    Arabic: String(o.Arabic ?? o.arabic ?? ""),
  };
}

export function flattenItems(categories: MenuCategory[]): FlatItem[] {
  const result: FlatItem[] = [];

  for (const cat of categories) {
    for (const sub of cat.subcategories ?? []) {
      for (const item of sub.items ?? []) {
        const raw = item as unknown as Record<string, unknown>;

        const itemName = toLocalized(raw.name);
        const itemDescription = toLocalized(raw.description);
        const hasName = itemName.English || itemName.Arabic;

        result.push({
          id: String(item.id),
          // Store full { English, Arabic } — don't resolve here
          name: hasName ? itemName : { English: String(item.id), Arabic: String(item.id) },
          description: itemDescription,
          price: (raw.price as number) || 0,
          // API serializes the image URL as `imageUrl`
          image: (raw.imageUrl as string) ?? item.image ?? "",
          href: String(raw.href ?? item.href ?? ""),
          category: (raw.category as string) || cat.id,
          categoryId: cat.id,
          isNew: item.isNew,
        });
      }
    }
  }

  return result;
}

/**
 * Helper to get the correct language string from a LocalizedContent object.
 * Used in components for rendering.
 */
export function getLocalizedText(content: { English: string; Arabic: string } | string | undefined, isRTL: boolean): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return isRTL ? content.Arabic : content.English;
}

/**
 * Returns a human-readable label for a category ID,
 * with RTL support.
 */
export function getCategoryLabel(catId: string, isRTL: boolean): string {
  if (catId === "drinks") return isRTL ? "المشروبات" : "Drinks";
  if (catId === "food") return isRTL ? "المأكولات" : "Food";
  return catId;
}
