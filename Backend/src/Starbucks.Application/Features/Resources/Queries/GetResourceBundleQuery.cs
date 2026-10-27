namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get complete resource bundle for Frontend
/// 
/// Single endpoint returns everything:
/// - All localization (UI text)
/// - All content (menu, locations, pages)
/// - Navigation structures
/// 
/// Replaces multiple API calls with single request
/// 
/// Cache key: resources:bundle:{language}:{client}
/// </summary>
public record GetResourceBundleQuery(
    string Language = "en",
    string Client = "frontend"
) : IRequest<Result<ResourceBundleDto>>;

public class GetResourceBundleQueryHandler : IRequestHandler<GetResourceBundleQuery, Result<ResourceBundleDto>>
{
    private readonly IMediator _mediator;
    private readonly ILocalizationResourceProvider _localizationProvider;

    public GetResourceBundleQueryHandler(
        IMediator mediator,
        ILocalizationResourceProvider localizationProvider)
    {
        _mediator = mediator;
        _localizationProvider = localizationProvider;
    }

    public async Task<Result<ResourceBundleDto>> Handle(
        GetResourceBundleQuery request,
        CancellationToken cancellationToken)
    {
        var localization = await _localizationProvider.GetModulesAsync(request.Language, cancellationToken)
            ?? new Dictionary<string, object>();

        var content = await _mediator.Send(
            new GetContentResourcesQuery(request.Language, Type: null),
            cancellationToken);

        if (!content.IsSuccess)
        {
            return Result<ResourceBundleDto>.Failure(content.Errors);
        }

        var navigation = await _mediator.Send(
            new GetNavigationQuery(request.Language),
            cancellationToken);

        if (!navigation.IsSuccess)
        {
            return Result<ResourceBundleDto>.Failure(navigation.Errors);
        }

        var versions = await _mediator.Send(
            new GetResourceVersionsQuery(),
            cancellationToken);

        if (!versions.IsSuccess)
        {
            return Result<ResourceBundleDto>.Failure(versions.Errors);
        }

        var bundle = new ResourceBundleDto
        {
            Language = request.Language,
            Localization = localization,
            Content = content.Data!,
            Navigation = navigation.Data!,
            Versions = versions.Data!,
            Timestamp = DateTime.UtcNow,
        };

        return Result<ResourceBundleDto>.Success(bundle);
    }
}
