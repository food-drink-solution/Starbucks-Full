namespace Starbucks.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

/// <summary>
/// Resources Controller - Serves localization and translation resources
/// 
/// Single unified endpoint for all client translations (Frontend, Dashboard, Mobile)
/// 
/// Benefits:
/// - Centralized resource management
/// - No duplication between Backend and Frontend
/// - Easy to add new modules
/// - Can be cached by CDN
/// - Resources versioned for cache busting
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/resources")]
[ApiVersion("1.0")]
public class LocalizationResourcesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<LocalizationResourcesController> _logger;

    public LocalizationResourcesController(IWebHostEnvironment env, ILogger<LocalizationResourcesController> logger)
    {
        _env = env;
        _logger = logger;
    }

    /// <summary>
    /// Get localization resources for all modules
    /// 
    /// GET /api/v1/resources/localization/en
    /// GET /api/v1/resources/localization/ar
    /// 
    /// Returns complete translation structure for all modules
    /// 
    /// Response:
    /// {
    ///   "common": { ... },
    ///   "menu": { ... },
    ///   "auth": { ... },
    ///   "checkout": { ... },
    ///   "locations": { ... },
    ///   "cart": { ... }
    /// }
    /// </summary>
    /// <param name="language">Language code: "en" or "ar"</param>
    /// <returns>All localization resources for the specified language</returns>
    [HttpGet("localization/{language}")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "language" })]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetLocalizationByLanguage(string language)
    {
        try
        {
            // Validate language
            if (!IsValidLanguage(language))
                return BadRequest(new { error = "Invalid language. Use 'en' or 'ar'" });

            var resourcePath = Path.Combine(_env.WebRootPath, "resources", "localization", language);

            if (!Directory.Exists(resourcePath))
            {
                _logger.LogWarning("Localization directory not found: {Path}", resourcePath);
                return NotFound(new { error = $"No resources found for language: {language}" });
            }

            // Load all JSON files from the language directory
            var resources = new Dictionary<string, object>();
            var files = Directory.GetFiles(resourcePath, "*.json");

            foreach (var file in files)
            {
                var moduleName = Path.GetFileNameWithoutExtension(file);
                var content = await System.IO.File.ReadAllTextAsync(file);
                var json = JsonSerializer.Deserialize<object>(content);
                resources[moduleName] = json;
            }

            return Ok(new
            {
                language,
                modules = resources,
                timestamp = DateTime.UtcNow,
                cacheVersion = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading localization for language: {Language}", language);
            return StatusCode(500, new { error = "Failed to load localization resources" });
        }
    }

    /// <summary>
    /// Get a specific module's translations
    /// 
    /// GET /api/v1/resources/localization/en/menu
    /// GET /api/v1/resources/localization/ar/checkout
    /// 
    /// Returns translations for a single module
    /// </summary>
    /// <param name="language">Language code: "en" or "ar"</param>
    /// <param name="module">Module name: "common", "menu", "auth", "checkout", "locations", "cart"</param>
    /// <returns>Localization resources for the specified module</returns>
    [HttpGet("localization/{language}/{module}")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "language", "module" })]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLocalizationModule(string language, string module)
    {
        try
        {
            // Validate inputs
            if (!IsValidLanguage(language))
                return BadRequest(new { error = "Invalid language. Use 'en' or 'ar'" });

            if (string.IsNullOrWhiteSpace(module) || !IsValidModuleName(module))
                return BadRequest(new { error = "Invalid module name" });

            var filePath = Path.Combine(_env.WebRootPath, "resources", "localization", language, $"{module}.json");

            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogWarning("Localization file not found: {Path}", filePath);
                return NotFound(new { error = $"Module '{module}' not found for language '{language}'" });
            }

            var content = await System.IO.File.ReadAllTextAsync(filePath);
            var json = JsonSerializer.Deserialize<object>(content);

            return Ok(new
            {
                language,
                module,
                resources = json,
                timestamp = DateTime.UtcNow,
                cacheVersion = 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading module {Module} for language {Language}", module, language);
            return StatusCode(500, new { error = "Failed to load localization module" });
        }
    }

    /// <summary>
    /// Get list of available localization modules
    /// 
    /// GET /api/v1/resources/localization/modules
    /// 
    /// Returns list of all available modules for each language
    /// </summary>
    /// <returns>Available modules</returns>
    [HttpGet("localization/modules")]
    [ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Any)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult GetAvailableModules()
    {
        try
        {
            var resourcePath = Path.Combine(_env.WebRootPath, "resources", "localization");

            if (!Directory.Exists(resourcePath))
            {
                return NotFound(new { error = "Resources directory not found" });
            }

            var modules = new Dictionary<string, string[]>();

            foreach (var lang in new[] { "en", "ar" })
            {
                var langPath = Path.Combine(resourcePath, lang);
                if (Directory.Exists(langPath))
                {
                    var moduleFiles = Directory.GetFiles(langPath, "*.json")
                        .Select(f => Path.GetFileNameWithoutExtension(f))
                        .OrderBy(m => m)
                        .ToArray();
                    modules[lang] = moduleFiles;
                }
            }

            return Ok(new
            {
                availableLanguages = modules.Keys.ToList(),
                modules,
                description = "Available localization modules for each language"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading available modules");
            return StatusCode(500, new { error = "Failed to load available modules" });
        }
    }

    /// <summary>
    /// Health check for resources API
    /// </summary>
    [HttpGet("localization/health")]
    [ResponseCache(Duration = 300)]
    public IActionResult HealthCheck()
    {
        try
        {
            var resourcePath = Path.Combine(_env.WebRootPath, "resources", "localization");
            var exists = Directory.Exists(resourcePath);

            return Ok(new
            {
                status = exists ? "healthy" : "unhealthy",
                resourcesPath = resourcePath,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return StatusCode(500, new { status = "error", error = ex.Message });
        }
    }

    /// <summary>
    /// Validate language code
    /// </summary>
    private static bool IsValidLanguage(string language)
    {
        return !string.IsNullOrWhiteSpace(language) && 
               (language.Equals("en", StringComparison.OrdinalIgnoreCase) || 
                language.Equals("ar", StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Validate module name (prevents directory traversal attacks)
    /// </summary>
    private static bool IsValidModuleName(string module)
    {
        var validModules = new[] { "common", "menu", "auth", "checkout", "locations", "cart", "navigation" };
        return validModules.Contains(module.ToLower());
    }
}
