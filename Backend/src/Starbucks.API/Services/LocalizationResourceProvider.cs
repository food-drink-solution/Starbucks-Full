namespace Starbucks.API.Services;

using System.Text.Json;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Interfaces.Services;

/// <summary>
/// Reads static localization JSON files from wwwroot/resources/localization/{language}/{module}.json.
/// Shared by the LocalizationResourcesController's file layout and the Resources MediatR handlers.
/// </summary>
public class LocalizationResourceProvider : ILocalizationResourceProvider
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IWebHostEnvironment _env;
    private readonly ILogger<LocalizationResourceProvider> _logger;

    public LocalizationResourceProvider(IWebHostEnvironment env, ILogger<LocalizationResourceProvider> logger)
    {
        _env = env;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Dictionary<string, object>?> GetModulesAsync(string language, CancellationToken cancellationToken = default)
    {
        if (!IsValidLanguage(language))
        {
            return null;
        }

        var resourcePath = Path.Combine(_env.WebRootPath, "resources", "localization", language);

        if (!Directory.Exists(resourcePath))
        {
            _logger.LogWarning("Localization directory not found: {Path}", resourcePath);
            return null;
        }

        var modules = new Dictionary<string, object>();

        foreach (var file in Directory.GetFiles(resourcePath, "*.json"))
        {
            var moduleName = Path.GetFileNameWithoutExtension(file);
            var module = await LoadModuleFileAsync(file, cancellationToken);

            if (module is not null)
            {
                modules[moduleName] = module;
            }
        }

        return modules.Count > 0 ? modules : null;
    }

    /// <inheritdoc />
    public async Task<Dictionary<string, object>?> GetModuleAsync(string language, string module, CancellationToken cancellationToken = default)
    {
        if (!IsValidLanguage(language) || string.IsNullOrWhiteSpace(module))
        {
            return null;
        }

        var file = Path.Combine(_env.WebRootPath, "resources", "localization", language, $"{module}.json");

        if (!File.Exists(file))
        {
            _logger.LogWarning("Localization module file not found: {Path}", file);
            return null;
        }

        return await LoadModuleFileAsync(file, cancellationToken);
    }

    private async Task<Dictionary<string, object>?> LoadModuleFileAsync(string file, CancellationToken cancellationToken)
    {
        try
        {
            var content = await File.ReadAllTextAsync(file, cancellationToken);
            return JsonSerializer.Deserialize<Dictionary<string, object>>(content, SerializerOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load localization file: {Path}", file);
            return null;
        }
    }

    private static bool IsValidLanguage(string language) =>
        language is "en" or "ar";
}
