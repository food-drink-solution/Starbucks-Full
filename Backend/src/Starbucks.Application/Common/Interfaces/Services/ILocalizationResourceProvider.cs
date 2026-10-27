namespace Starbucks.Application.Common.Interfaces.Services;

/// <summary>
/// Provides file-based localization resources (wwwroot/resources/localization/{language}/{module}.json).
/// Implemented in the API layer where wwwroot is available; consumed by Resources query handlers.
/// </summary>
public interface ILocalizationResourceProvider
{
    /// <summary>
    /// Loads every module's translations for a language.
    /// Returns null when the language is unsupported or no files exist.
    /// </summary>
    Task<Dictionary<string, object>?> GetModulesAsync(string language, CancellationToken cancellationToken = default);

    /// <summary>
    /// Loads a single module's translations for a language.
    /// Returns null when the language is unsupported, or the module file does not exist.
    /// </summary>
    Task<Dictionary<string, object>?> GetModuleAsync(string language, string module, CancellationToken cancellationToken = default);
}
