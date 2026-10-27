using System.Text;

namespace Starbucks.Application.Common.Utilities;

/// <summary>
/// Utility class for generating consistent cache keys.
/// Provides methods to generate cache keys for different query types.
/// </summary>
public static class CacheKeyGenerator
{
    private const string Separator = "_";

    /// <summary>
    /// Generate a cache key from multiple parts.
    /// </summary>
    public static string Generate(params object?[] parts)
    {
        var sb = new StringBuilder();
        foreach (var part in parts)
        {
            if (part != null)
            {
                if (sb.Length > 0)
                    sb.Append(Separator);
                sb.Append(part);
            }
        }
        return sb.ToString();
    }

    /// <summary>
    /// Generate a cache key for a menu category by slug.
    /// </summary>
    public static string MenuCategoryBySlug(string slug, string? language = null)
        => Generate("menu_category_slug", slug, language ?? "all");

    /// <summary>
    /// Generate a cache key for a menu subcategory by slug.
    /// </summary>
    public static string MenuSubcategoryBySlug(string categorySlug, string subcategorySlug, string? language = null)
        => Generate("menu_subcategory_slug", categorySlug, subcategorySlug, language ?? "all");

    /// <summary>
    /// Generate a cache key for menu categories.
    /// </summary>
    public static string MenuCategories(string? language = null, int pageNumber = 1, int pageSize = 20)
        => Generate("menu_categories", language ?? "all", $"page{pageNumber}", $"size{pageSize}");

    /// <summary>
    /// Generate a cache key for a menu item.
    /// </summary>
    public static string MenuItem(Guid id)
        => Generate("menu_item", id);

    /// <summary>
    /// Generate a cache key for menu item search.
    /// </summary>
    public static string MenuItemSearch(string query, string? category = null, string? language = null, int pageNumber = 1, int pageSize = 20)
        => Generate("menu_search", query, category ?? "all", language ?? "all", $"page{pageNumber}", $"size{pageSize}");

    /// <summary>
    /// Generate a cache key for locations.
    /// </summary>
    public static string Locations(string? city = null, string? governorate = null, int pageNumber = 1, int pageSize = 50)
        => Generate("locations", city ?? "all", governorate ?? "all", $"page{pageNumber}", $"size{pageSize}");

    /// <summary>
    /// Generate a cache key for a location by ID.
    /// </summary>
    public static string Location(Guid id)
        => Generate("location", id);

    /// <summary>
    /// Generate a cache key for cities list.
    /// </summary>
    public static string Cities()
        => "locations_cities_list";

    /// <summary>
    /// Generate a cache key for nearby locations.
    /// </summary>
    public static string NearbyLocations(double latitude, double longitude, double radius, int pageNumber = 1, int pageSize = 50)
        // Coordinates are user location data — hashed into a non-reversible
        // ~110m bucket before entering any cache key (CodeQL: exposure of
        // sensitive information to an external store / logs).
        => Generate("locations_nearby", PiiGuard.HashCoordinates(latitude, longitude), radius,
            $"page{pageNumber}", $"size{pageSize}");
}
