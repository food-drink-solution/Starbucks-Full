import type { MenuCategory } from "@/types";
import type { FlatItem } from "./types";

/**
 * Flattens all nested category → subcategory → item
 * structures into a single array of FlatItem objects.
 * 
 * Now converts LocalizedContent fields (from API) into the FlatItem shape
 * without any language-specific field switching — components receive
 * the full { English, Arabic } object and decide what to display.
 */
export function flattenItems(categories: MenuCategory[]): FlatItem[] {
  const result: FlatItem[] = [];

  for (const cat of categories) {
    for (const sub of cat.subcategories ?? []) {
      for (const item of sub.items ?? []) {
        const raw = item as unknown as Record<string, unknown>;
        
        // Extract LocalizedContent objects from the API response
        const itemName = raw.name as FlatItem['name'] | undefined;
        const itemDescription = raw.description as FlatItem['description'] | undefined;
        
        result.push({
          id: String(item.id),
          // Store full { English, Arabic } — don't resolve here
          name: itemName || { English: String(item.id), Arabic: String(item.id) },
          description: itemDescription || { English: "", Arabic: "" },
          price: (raw.price as number) || 0,
          image: item.image,
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
