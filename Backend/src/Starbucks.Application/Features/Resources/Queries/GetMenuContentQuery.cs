namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Interfaces.Data;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get complete menu with all categories, subcategories, and items
/// 
/// Returns full menu tree with bilingual names and descriptions
/// 
/// Cache key: resources:menu:{language}
/// </summary>
public record GetMenuContentQuery(
    string Language = "en"
) : IRequest<Result<MenuContentDto>>;

public class GetMenuContentQueryHandler : IRequestHandler<GetMenuContentQuery, Result<MenuContentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMenuContentQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<MenuContentDto>> Handle(
        GetMenuContentQuery request,
        CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Menu.GetCategoriesAsync(cancellationToken);

        var dto = new MenuContentDto
        {
            Categories = categories.Select(c => new MenuCategoryResourceDto
            {
                Id = c.Id.ToString(),
                Name = ResourceMapper.Map(c.Name),
                Description = ResourceMapper.Map(c.Description),
                Image = c.ImageUrl,
                Subcategories = c.Subcategories
                    .Where(s => s.IsActive)
                    .Select(s => new MenuSubcategoryResourceDto
                    {
                        Id = s.Id.ToString(),
                        Name = ResourceMapper.Map(s.Name),
                        Image = s.ImageUrl,
                        Items = s.Items
                            .Where(i => i.IsActive)
                            .Select(i => new MenuItemResourceDto
                            {
                                Id = i.Id.ToString(),
                                Name = ResourceMapper.Map(i.Name),
                                Description = ResourceMapper.Map(i.Description),
                                Price = i.DiscountedPrice ?? i.Price,
                                IsNew = i.IsNew,
                                Image = i.ImageUrl,
                            })
                            .ToList(),
                    })
                    .ToList(),
            }).ToList(),
        };

        return Result<MenuContentDto>.Success(dto);
    }
}
