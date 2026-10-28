using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Repositories;
using Starbucks.Application.Common.Specifications;
using Starbucks.Domain.Entities;
using Starbucks.Domain.Identity;
using Starbucks.Infrastructure.Data;

namespace Starbucks.Infrastructure.Repositories;

/// <summary>
/// User repository implementation
/// Provides user-specific data access operations
/// </summary>
public class UserRepository : Repository<ApplicationUser>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var spec = new UserByEmailSpecification(email);
        return await GetSingleAsync(spec, cancellationToken);
    }

    public async Task<ApplicationUser?> GetByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var spec = new UserByPhoneSpecification(phoneNumber);
        return await GetSingleAsync(spec, cancellationToken);
    }

    public async Task<(IEnumerable<ApplicationUser> Items, int TotalCount)> GetVerifiedUsersPagedAsync(
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var spec = new VerifiedUsersPagedSpecification(pageNumber, pageSize);
        return await GetPagedAsync(spec, pageNumber, pageSize, cancellationToken);
    }

    public async Task<IEnumerable<ApplicationUser>> GetByRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<Domain.Enums.UserRole>(role, true, out var userRole))
        {
            return Enumerable.Empty<ApplicationUser>();
        }

        var spec = new UsersByRoleSpecification(userRole);
        return await GetAsync(spec, cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        var spec = new UserByEmailSpecification(email);
        return await AnyAsync(spec, cancellationToken);
    }

    public async Task<bool> PhoneExistsAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var spec = new UserByPhoneSpecification(phoneNumber);
        return await AnyAsync(spec, cancellationToken);
    }

    public async Task<IEnumerable<ApplicationUser>> GetUsersWithFailedLoginsAsync(
        int minAttempts,
        CancellationToken cancellationToken = default)
    {
        var spec = new UsersWithFailedLoginsSpecification(minAttempts);
        return await GetAsync(spec, cancellationToken);
    }
}
