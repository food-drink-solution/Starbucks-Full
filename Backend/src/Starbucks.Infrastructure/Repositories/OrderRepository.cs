using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Repositories;
using Starbucks.Domain.Entities;
using Starbucks.Domain.Enums;
using Starbucks.Infrastructure.Data;

namespace Starbucks.Infrastructure.Repositories;

/// <summary>
/// Order repository implementation
/// </summary>
public class OrderRepository : Repository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByStatusAsync(OrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status == status && !o.IsDeleted)
            .Include(o => o.User)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetPendingOrdersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Pending && !o.IsDeleted)
            .Include(o => o.User)
            .Include(o => o.Items)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetByLocationIdAsync(Guid locationId, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.LocationId == locationId && !o.IsDeleted)
            .Include(o => o.User)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.OrderNumber == orderNumber && !o.IsDeleted)
            .Include(o => o.User)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Order>> GetUserRecentOrdersAsync(Guid userId, int count, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId && !o.IsDeleted)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}
