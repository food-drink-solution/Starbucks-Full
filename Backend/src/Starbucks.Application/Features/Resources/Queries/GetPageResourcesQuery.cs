namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get page-specific content and localization
/// 
/// Combines page content with all related localization strings
/// 
/// Cache key: resources:page:{pageSlug}:{language}
/// </summary>
public record GetPageResourcesQuery(
    string PageSlug,
    string Language = "en"
) : IRequest<Result<PageContentDto>>;

public class GetPageResourcesQueryHandler : IRequestHandler<GetPageResourcesQuery, Result<PageContentDto>>
{
    public Task<Result<PageContentDto>> Handle(
        GetPageResourcesQuery request,
        CancellationToken cancellationToken)
    {
        var page = StaticResources.Page(request.PageSlug);

        if (page is null)
        {
            return Task.FromResult(Result<PageContentDto>.Failure($"Unknown page: {request.PageSlug}"));
        }

        return Task.FromResult(Result<PageContentDto>.Success(page));
    }
}
