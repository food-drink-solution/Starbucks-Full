namespace Starbucks.Application.DTOs.Resources;

/// <summary>
/// Complete resource bundle - Everything Frontend needs in one response
/// </summary>
public class ResourceBundleDto
{
    /// <summary>
    /// Active language
    /// </summary>
    public string Language { get; set; } = "en";

    /// <summary>
    /// All localization (UI text, labels, messages)
    /// Organized by module: common, menu, auth, checkout, locations, cart, navigation
    /// Values are deep JSON objects loaded from the localization resource files.
    /// </summary>
    public Dictionary<string, object> Localization { get; set; } = new();

    /// <summary>
    /// All content resources
    /// </summary>
    public ContentResourceDto Content { get; set; } = new();

    /// <summary>
    /// Navigation structure (navbar, footer, breadcrumbs)
    /// </summary>
    public NavigationResourceDto Navigation { get; set; } = new();

    /// <summary>
    /// Version for cache invalidation
    /// </summary>
    public ResourceVersionsDto Versions { get; set; } = new();

    /// <summary>
    /// Timestamp for debugging
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Content resources (business data)
/// </summary>
public class ContentResourceDto
{
    /// <summary>
    /// Complete menu with categories, subcategories, items
    /// </summary>
    public MenuContentDto? Menu { get; set; }

    /// <summary>
    /// All store locations
    /// </summary>
    public LocationsContentDto? Locations { get; set; }

    /// <summary>
    /// Static page content
    /// </summary>
    public Dictionary<string, PageContentDto> Pages { get; set; } = new();

    /// <summary>
    /// Contact information
    /// </summary>
    public ContactContentDto? Contact { get; set; }

    /// <summary>
    /// Homepage content
    /// </summary>
    public HomeContentDto? Home { get; set; }
}

/// <summary>
/// Menu content structure
/// </summary>
public class MenuContentDto
{
    public List<MenuCategoryResourceDto> Categories { get; set; } = new();
    public Dictionary<string, string> Metadata { get; set; } = new();
}

/// <summary>
/// Menu category with localized name
/// </summary>
public class MenuCategoryResourceDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Name { get; set; } = new();
    public LocalizedStringDto? Description { get; set; }
    public string? Image { get; set; }
    public List<MenuSubcategoryResourceDto>? Subcategories { get; set; }
}

/// <summary>
/// Menu subcategory
/// </summary>
public class MenuSubcategoryResourceDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Name { get; set; } = new();
    public string? Image { get; set; }
    public List<MenuItemResourceDto>? Items { get; set; }
}

/// <summary>
/// Menu item with price
/// </summary>
public class MenuItemResourceDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Name { get; set; } = new();
    public LocalizedStringDto? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsNew { get; set; }
    public string? Image { get; set; }
}

/// <summary>
/// Locations content
/// </summary>
public class LocationsContentDto
{
    public List<CityResourceDto> Cities { get; set; } = new();
    public List<StoreResourceDto>? Stores { get; set; }
}

/// <summary>
/// City with localized name
/// </summary>
public class CityResourceDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Name { get; set; } = new();
    public int StoreCount { get; set; }
}

/// <summary>
/// Individual store location
/// </summary>
public class StoreResourceDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Name { get; set; } = new();
    public LocalizedStringDto Address { get; set; } = new();
    public string? City { get; set; }
    public string Phone { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public List<string>? Services { get; set; }
}

/// <summary>
/// Page-specific content
/// </summary>
public class PageContentDto
{
    public string Slug { get; set; } = string.Empty;
    public LocalizedStringDto Title { get; set; } = new();
    public LocalizedStringDto? Description { get; set; }
    public Dictionary<string, object>? Sections { get; set; }
    public string? Image { get; set; }
}

/// <summary>
/// Contact information
/// </summary>
public class ContactContentDto
{
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public Dictionary<string, string>? SocialMedia { get; set; }
}

/// <summary>
/// Homepage content
/// </summary>
public class HomeContentDto
{
    public LocalizedStringDto? HeroTitle { get; set; }
    public LocalizedStringDto? HeroDescription { get; set; }
    public string? HeroImage { get; set; }
    public List<FeaturedItemDto>? FeaturedItems { get; set; }
}

/// <summary>
/// Featured item on homepage
/// </summary>
public class FeaturedItemDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Title { get; set; } = new();
    public string? Image { get; set; }
    public string? Link { get; set; }
}

/// <summary>
/// Navigation resources
/// </summary>
public class NavigationResourceDto
{
    public NavbarDto? Navbar { get; set; }
    public FooterDto? Footer { get; set; }
    public List<NavItemDto>? Breadcrumbs { get; set; }
}

/// <summary>
/// Navbar items with localized text
/// </summary>
public class NavbarDto
{
    public LocalizedStringDto Logo { get; set; } = new();
    public List<NavItemDto>? Items { get; set; }
}

/// <summary>
/// Navigation item
/// </summary>
public class NavItemDto
{
    public string Id { get; set; } = string.Empty;
    public LocalizedStringDto Label { get; set; } = new();
    public string? Url { get; set; }
    public List<NavItemDto>? Children { get; set; }
}

/// <summary>
/// Footer items with localized text
/// </summary>
public class FooterDto
{
    public List<FooterColumnDto>? Columns { get; set; }
    public LocalizedStringDto Copyright { get; set; } = new();
}

/// <summary>
/// Footer column
/// </summary>
public class FooterColumnDto
{
    public LocalizedStringDto Title { get; set; } = new();
    public List<NavItemDto>? Items { get; set; }
}

/// <summary>
/// Localized string (English + Arabic)
/// </summary>
public class LocalizedStringDto
{
    public string English { get; set; } = string.Empty;
    public string Arabic { get; set; } = string.Empty;
}

/// <summary>
/// Resource versions for cache invalidation
/// </summary>
public class ResourceVersionsDto
{
    public int Localization { get; set; } = 1;
    public int Menu { get; set; } = 1;
    public int Locations { get; set; } = 1;
    public int Pages { get; set; } = 1;
    public int Navigation { get; set; } = 1;
}
