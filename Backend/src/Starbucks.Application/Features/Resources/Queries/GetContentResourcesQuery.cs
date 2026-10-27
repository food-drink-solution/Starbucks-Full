namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get content resources (menu, locations, pages, etc.)
/// 
/// Types: menu, locations, pages, contact, home
/// 
/// Cache key: resources:content:{language}:{type}
/// </summary>
public record GetContentResourcesQuery(
    string Language = "en",
    string? Type = null
) : IRequest<Result<ContentResourceDto>>;

public class GetContentResourcesQueryHandler : IRequestHandler<GetContentResourcesQuery, Result<ContentResourceDto>>
{
    private readonly IMediator _mediator;

    public GetContentResourcesQueryHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<Result<ContentResourceDto>> Handle(
        GetContentResourcesQuery request,
        CancellationToken cancellationToken)
    {
        var content = new ContentResourceDto();
        var includeAll = string.IsNullOrWhiteSpace(request.Type);

        if (includeAll || request.Type == "menu")
        {
            var menu = await _mediator.Send(new GetMenuContentQuery(request.Language), cancellationToken);

            if (!menu.IsSuccess)
            {
                return Result<ContentResourceDto>.Failure(menu.Errors);
            }

            content.Menu = menu.Data;
        }

        if (includeAll || request.Type == "locations")
        {
            var locations = await _mediator.Send(new GetLocationsContentQuery(request.Language), cancellationToken);

            if (!locations.IsSuccess)
            {
                return Result<ContentResourceDto>.Failure(locations.Errors);
            }

            content.Locations = locations.Data;
        }

        if (includeAll || request.Type == "pages")
        {
            content.Pages = StaticResources.KnownPageSlugs
                .Select(slug => StaticResources.Page(slug)!)
                .ToDictionary(p => p.Slug, p => p);
        }

        if (includeAll || request.Type == "contact")
        {
            content.Contact = StaticResources.Contact();
        }

        if (includeAll || request.Type == "home")
        {
            content.Home = StaticResources.Home();
        }

        return Result<ContentResourceDto>.Success(content);
    }
}
