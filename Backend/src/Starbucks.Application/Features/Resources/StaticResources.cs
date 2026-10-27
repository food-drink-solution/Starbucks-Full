namespace Starbucks.Application.Features.Resources;

using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Static resource structures for navigation, pages, contact, and home content.
/// These are design-time content (not database-driven) shared by the Resources handlers.
/// </summary>
internal static class StaticResources
{
    public static NavigationResourceDto Navigation() => new()
    {
        Navbar = new NavbarDto
        {
            Logo = new LocalizedStringDto { English = "Starbucks", Arabic = "ستاربكس" },
            Items = new List<NavItemDto>
            {
                new()
                {
                    Id = "home",
                    Label = new LocalizedStringDto { English = "Home", Arabic = "الرئيسية" },
                    Url = "/",
                },
                new()
                {
                    Id = "menu",
                    Label = new LocalizedStringDto { English = "Menu", Arabic = "المنيو" },
                    Url = "/menu",
                },
                new()
                {
                    Id = "rewards",
                    Label = new LocalizedStringDto { English = "Rewards", Arabic = "المكافآت" },
                    Url = "/rewards",
                },
                new()
                {
                    Id = "locations",
                    Label = new LocalizedStringDto { English = "Locations", Arabic = "الفروع" },
                    Url = "/locations",
                },
                new()
                {
                    Id = "contact",
                    Label = new LocalizedStringDto { English = "Contact Us", Arabic = "اتصل بنا" },
                    Url = "/contact",
                },
            },
        },
        Footer = new FooterDto
        {
            Columns = new List<FooterColumnDto>
            {
                new()
                {
                    Title = new LocalizedStringDto { English = "About Us", Arabic = "من نحن" },
                    Items = new List<NavItemDto>
                    {
                        new() { Id = "about-us", Label = new LocalizedStringDto { English = "Our Company", Arabic = "شركتنا" }, Url = "/about-us" },
                        new() { Id = "careers", Label = new LocalizedStringDto { English = "Careers", Arabic = "الوظائف" }, Url = "/careers" },
                    },
                },
                new()
                {
                    Title = new LocalizedStringDto { English = "Support", Arabic = "الدعم" },
                    Items = new List<NavItemDto>
                    {
                        new() { Id = "contact", Label = new LocalizedStringDto { English = "Contact Us", Arabic = "اتصل بنا" }, Url = "/contact" },
                        new() { Id = "locations", Label = new LocalizedStringDto { English = "Store Locations", Arabic = "فروع المتاجر" }, Url = "/locations" },
                    },
                },
                new()
                {
                    Title = new LocalizedStringDto { English = "Legal", Arabic = "قانوني" },
                    Items = new List<NavItemDto>
                    {
                        new() { Id = "privacy", Label = new LocalizedStringDto { English = "Privacy Statement", Arabic = "بيان الخصوصية" }, Url = "/privacy-statement" },
                        new() { Id = "terms", Label = new LocalizedStringDto { English = "Terms of Use", Arabic = "شروط الاستخدام" }, Url = "/terms-of-use" },
                    },
                },
            },
            Copyright = new LocalizedStringDto
            {
                English = "© 2026 Starbucks Coffee Company. All rights reserved.",
                Arabic = "© 2026 ستاربكس للقهوة. جميع الحقوق محفوظة.",
            },
        },
        Breadcrumbs = null,
    };

    public static ContactContentDto Contact() => new()
    {
        Email = "support@starbucks.com",
        Phone = "+1-800-STARBUCKS",
        Address = "2401 Utah Avenue South, Seattle, WA 98134",
        SocialMedia = new Dictionary<string, string>
        {
            ["facebook"] = "https://facebook.com/starbucks",
            ["twitter"] = "https://twitter.com/starbucks",
            ["instagram"] = "https://instagram.com/starbucks",
        },
    };

    public static HomeContentDto Home() => new()
    {
        HeroTitle = new LocalizedStringDto
        {
            English = "Handcrafted moments, one cup at a time",
            Arabic = "لحظات مصنوعة بعناية، كوبًا بعد كوب",
        },
        HeroDescription = new LocalizedStringDto
        {
            English = "Explore our menu, find a store, and earn rewards with every order.",
            Arabic = "استكشف المنيو، ابحث عن فرع، واكسب المكافآت مع كل طلب.",
        },
        HeroImage = "/images/hero/home-hero.webp",
        FeaturedItems = null,
    };

    /// <summary>
    /// Returns page content for a slug, or null when the slug is unknown.
    /// </summary>
    public static PageContentDto? Page(string pageSlug)
    {
        var slug = pageSlug?.ToLowerInvariant() ?? string.Empty;

        return slug switch
        {
            "menu" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "Menu", Arabic = "المنيو" },
                Description = new LocalizedStringDto
                {
                    English = "Browse our handcrafted beverages, delicious food, and coffee beans.",
                    Arabic = "تصفح مشروباتنا المصنوعة يدويًا، وأطعمتنا اللذيذة، وحبوب القهوة.",
                },
            },
            "checkout" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "Checkout", Arabic = "إتمام الطلب" },
                Description = new LocalizedStringDto
                {
                    English = "Review your bag and complete your order.",
                    Arabic = "راجع حقيبتك وأكمل طلبك.",
                },
            },
            "locations" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "Store Locations", Arabic = "فروع المتاجر" },
                Description = new LocalizedStringDto
                {
                    English = "Find a Starbucks store near you.",
                    Arabic = "اعثر على فرع ستاربكس قريب منك.",
                },
            },
            "about-us" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "About Us", Arabic = "من نحن" },
                Description = new LocalizedStringDto
                {
                    English = "Starbucks is committed to providing high quality coffee and exceptional service.",
                    Arabic = "تلتزم ستاربكس بتقديم قهوة عالية الجودة وخدمة استثنائية.",
                },
            },
            "contact" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "Contact Us", Arabic = "اتصل بنا" },
                Description = new LocalizedStringDto
                {
                    English = "We would love to hear from you. Send us your feedback or questions.",
                    Arabic = "يسعدنا أن نسمع منك. أرسل لنا ملاحظاتك أو أسئلتك.",
                },
            },
            "home" => new PageContentDto
            {
                Slug = slug,
                Title = new LocalizedStringDto { English = "Home", Arabic = "الرئيسية" },
                Description = new LocalizedStringDto
                {
                    English = "The best way to order, pay and earn rewards is through the Starbucks app.",
                    Arabic = "أفضل طريقة للطلب والدفع وكسب المكافآت هي من خلال تطبيق ستاربكس.",
                },
            },
            _ => null,
        };
    }

    /// <summary>
    /// Slugs served by the static page dictionary.
    /// </summary>
    public static IReadOnlyCollection<string> KnownPageSlugs { get; } = new[]
    {
        "menu",
        "checkout",
        "locations",
        "about-us",
        "contact",
        "home",
    };
}
