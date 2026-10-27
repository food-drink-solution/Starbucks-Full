namespace Starbucks.API.Controllers;

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Starbucks.API.Extensions;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;
using Starbucks.Application.Features.Resources.Queries;

/// <summary>
/// Resources API Controller - Single Source of Truth for Frontend
/// 
/// Serves ALL resource needs:
/// - Localization (UI text, labels, messages)
/// - Content (menu, locations, pages)
/// - Navigation structures
/// - Static page data
/// 
/// Frontend gets EVERYTHING from this single API
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class ResourcesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ResourcesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get complete resource bundle for Frontend
    /// 
    /// Combines localization, content, and navigation in single response
    /// 
    /// GET /api/v1/resources/bundle?language=ar&amp;client=frontend
    /// 
    /// Response includes:
    /// {
    ///   "localization": { ... all UI text ... },
    ///   "content": { ... menu, locations, pages ... },
    ///   "navigation": { ... navbar, footer ... },
    ///   "version": 1,
    ///   "timestamp": "2024-01-01T12:00:00Z"
    /// }
    /// </summary>
    [HttpGet("bundle")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language", "client" })]
    public async Task<IActionResult> GetResourceBundle(
        [FromQuery] string language = "en",
        [FromQuery] string client = "frontend")
    {
        var query = new GetResourceBundleQuery(language, client);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get localization resources only
    /// 
    /// GET /api/v1/resources/localization?language=ar&amp;module=menu
    /// </summary>
    [HttpGet("localization")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language", "module", "client" })]
    public async Task<IActionResult> GetLocalization(
        [FromQuery] string language = "en",
        [FromQuery] string? module = null,
        [FromQuery] string client = "frontend")
    {
        var query = new GetLocalizationQuery(language, module, client);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get content resources (menu, locations, pages)
    /// 
    /// GET /api/v1/resources/content?language=ar&amp;type=menu
    /// 
    /// Types: menu, locations, pages, contact, home
    /// </summary>
    [HttpGet("content")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language", "type" })]
    public async Task<IActionResult> GetContent(
        [FromQuery] string language = "en",
        [FromQuery] string? type = null)
    {
        var query = new GetContentResourcesQuery(language, type);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get navigation structure
    /// 
    /// GET /api/v1/resources/navigation?language=ar
    /// 
    /// Includes navbar, footer, breadcrumbs, sidebar
    /// </summary>
    [HttpGet("navigation")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language" })]
    public async Task<IActionResult> GetNavigation(
        [FromQuery] string language = "en")
    {
        var query = new GetNavigationQuery(language);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get complete menu with all categories, subcategories, and items
    /// 
    /// GET /api/v1/resources/content/menu?language=ar
    /// 
    /// Returns full menu tree with bilingual names and descriptions
    /// </summary>
    [HttpGet("content/menu")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language" })]
    public async Task<IActionResult> GetMenuContent(
        [FromQuery] string language = "en")
    {
        var query = new GetMenuContentQuery(language);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get all store locations grouped by city
    /// 
    /// GET /api/v1/resources/content/locations?language=ar
    /// 
    /// Returns locations with bilingual names
    /// </summary>
    [HttpGet("content/locations")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language" })]
    public async Task<IActionResult> GetLocationsContent(
        [FromQuery] string language = "en")
    {
        var query = new GetLocationsContentQuery(language);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get page-specific content and localization
    /// 
    /// GET /api/v1/resources/pages/menu?language=ar
    /// 
    /// Page names: menu, checkout, locations, about-us, contact, etc.
    /// </summary>
    [HttpGet("pages/{pageSlug}")]
    [ResponseCache(Duration = 3600, VaryByQueryKeys = new[] { "language" })]
    public async Task<IActionResult> GetPageResources(
        string pageSlug,
        [FromQuery] string language = "en")
    {
        var query = new GetPageResourcesQuery(pageSlug, language);
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }

    /// <summary>
    /// Get resource versions for cache invalidation
    /// 
    /// GET /api/v1/resources/versions
    /// 
    /// Returns current version for each resource type
    /// Frontend can use to know when to refresh cache
    /// </summary>
    [HttpGet("versions")]
    [ResponseCache(Duration = 300)]  // Cache for 5 minutes
    public async Task<IActionResult> GetResourceVersions()
    {
        var query = new GetResourceVersionsQuery();
        var result = await _mediator.Send(query);
        return result.ToActionResult(this);
    }
}
