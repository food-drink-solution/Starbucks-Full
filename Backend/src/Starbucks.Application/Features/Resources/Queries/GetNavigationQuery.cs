namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get navigation structure (navbar, footer, breadcrumbs)
/// 
/// Cache key: resources:navigation:{language}
/// </summary>
public record GetNavigationQuery(
    string Language = "en"
) : IRequest<Result<NavigationResourceDto>>;

public class GetNavigationQueryHandler : IRequestHandler<GetNavigationQuery, Result<NavigationResourceDto>>
{
    public Task<Result<NavigationResourceDto>> Handle(
        GetNavigationQuery request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(Result<NavigationResourceDto>.Success(StaticResources.Navigation()));
    }
}
