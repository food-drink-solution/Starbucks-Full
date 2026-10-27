using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Repositories;
using Starbucks.Application.Common.Specifications;
using Starbucks.Domain.Entities;
using Starbucks.Infrastructure.Data;

namespace Starbucks.Infrastructure.Repositories;

/// <summary>
/// Menu repository implementation
/// Provides menu-specific data access operations for categories, items, and variants
/// </summary>
public class MenuRepository : Repository<MenuItem>, IMenuRepository
{
    private readonly ApplicationDbContext _context;

    public MenuRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets menu items by category
    /// </summary>
    public async Task<IEnumerable<MenuItem>> GetByCategoryAsync(
        Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        return await _context.MenuItems
            .Where(i => i.Subcategory.CategoryId == categoryId && i.IsActive && i.IsAvailable)
            .Include(i => i.Variants)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets menu items by subcategory
    /// </summary>
    public async Task<IEnumerable<MenuItem>> GetBySubcategoryAsync(
        Guid subcategoryId,
        CancellationToken cancellationToken = default)
    {
        return await _context.MenuItems
            .Where(i => i.SubcategoryId == subcategoryId && i.IsActive && i.IsAvailable)
            .Include(i => i.Variants)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Searches menu items by name (supports localized search)
    /// </summary>
    public async Task<IEnumerable<MenuItem>> SearchByNameAsync(
        string searchTerm,
        CancellationToken cancellationToken = default)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        return await _context.MenuItems
            .Where(i => i.IsActive && i.IsAvailable &&
                   (i.Name.English.ToLower().Contains(lowerSearchTerm) ||
                    i.Name.Arabic.ToLower().Contains(lowerSearchTerm)))
            .Include(i => i.Variants)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets available menu items
    /// </summary>
    public async Task<IEnumerable<MenuItem>> GetAvailableAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MenuItems
            .Where(i => i.IsActive && i.IsAvailable)
            .Include(i => i.Variants)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets menu items with variants
    /// </summary>
    public async Task<IEnumerable<MenuItem>> GetWithVariantsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MenuItems
            .Where(i => i.IsActive)
            .Include(i => i.Variants)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets menu categories
    /// </summary>
    public async Task<IEnumerable<MenuCategory>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.MenuCategories
            .Where(c => c.IsActive)
            .Include(c => c.Subcategories.Where(s => s.IsActive))
            .ThenInclude(s => s.Items.Where(i => i.IsActive))
            .OrderBy(c => c.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets menu category by slug with all subcategories and items
    /// </summary>
    public async Task<MenuCategory?> GetCategoryBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        return await _context.MenuCategories
            .Where(c => c.Slug == slug && c.IsActive)
            .Include(c => c.Subcategories.Where(s => s.IsActive))
            .ThenInclude(s => s.Items.Where(i => i.IsActive))
            .ThenInclude(i => i.Variants)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
