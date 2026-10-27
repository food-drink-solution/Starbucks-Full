namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;

/// <summary>
/// Get localization resources only
/// 
/// Returns all UI text, labels, messages organized by module
/// 
/// Cache key: resources:localization:{language}:{module}:{client}
/// </summary>
public record GetLocalizationQuery(
    string Language = "en",
    string? Module = null,
    string Client = "frontend"
) : IRequest<Result<Dictionary<string, object>>>;

public class GetLocalizationQueryHandler : IRequestHandler<GetLocalizationQuery, Result<Dictionary<string, object>>>
{
    private readonly ILocalizationResourceProvider _provider;

    public GetLocalizationQueryHandler(ILocalizationResourceProvider provider)
    {
        _provider = provider;
    }

    public async Task<Result<Dictionary<string, object>>> Handle(
        GetLocalizationQuery request,
        CancellationToken cancellationToken)
    {
        var modules = await _provider.GetModulesAsync(request.Language, cancellationToken);

        if (modules is null)
        {
            return Result<Dictionary<string, object>>.Failure(
                $"No localization resources found for language: {request.Language}");
        }

        if (!string.IsNullOrWhiteSpace(request.Module))
        {
            if (!modules.TryGetValue(request.Module, out var module))
            {
                return Result<Dictionary<string, object>>.Failure(
                    $"Unknown localization module: {request.Module}");
            }

            return Result<Dictionary<string, object>>.Success(
                new Dictionary<string, object> { [request.Module] = module });
        }

        return Result<Dictionary<string, object>>.Success(modules);
    }
}
