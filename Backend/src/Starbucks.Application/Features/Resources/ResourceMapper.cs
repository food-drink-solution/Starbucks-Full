namespace Starbucks.Application.Features.Resources;

using Starbucks.Application.DTOs.Resources;
using Starbucks.Domain.Common;

/// <summary>
/// Maps domain LocalizedContent values to Resources DTO shapes.
/// </summary>
internal static class ResourceMapper
{
    public static LocalizedStringDto Map(LocalizedContent? content) =>
        content is null
            ? new LocalizedStringDto()
            : new LocalizedStringDto { English = content.English, Arabic = content.Arabic };

    /// <summary>
    /// Maps a plain string (no Arabic translation available) to both halves of a LocalizedStringDto.
    /// </summary>
    public static LocalizedStringDto MapPlain(string value) =>
        new() { English = value, Arabic = value };
}
