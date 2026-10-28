using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Repositories;
using Starbucks.Application.Common.Specifications;
using Starbucks.Domain.Entities;
using Starbucks.Infrastructure.Data;

namespace Starbucks.Infrastructure.Repositories;

/// <summary>
/// Location repository implementation
/// Provides location-specific data access operations including geospatial queries
/// </summary>
public class LocationRepository : Repository<Location>, ILocationRepository
{
    public LocationRepository(ApplicationDbContext context) : base(context)
    {
    }

    /// <summary>
    /// Gets locations by city
    /// </summary>
    public async Task<IEnumerable<Location>> GetByCityAsync(
        string city,
        CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive && l.City == city)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets locations by governorate
    /// </summary>
    public async Task<IEnumerable<Location>> GetByGovernorateAsync(
        string governorate,
        CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive && l.Governorate == governorate)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets all unique cities with active locations
    /// </summary>
    public async Task<IEnumerable<string>> GetCitiesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive)
            .Select(l => l.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets all unique governorates with active locations
    /// </summary>
    public async Task<IEnumerable<string>> GetGovernoratesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive)
            .Select(l => l.Governorate)
            .Distinct()
            .OrderBy(g => g)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Gets nearby locations using Haversine formula
    /// Distance in kilometers
    /// </summary>
    public async Task<IEnumerable<Location>> GetNearbyAsync(
        double latitude,
        double longitude,
        double radiusKm = 5.0,
        CancellationToken cancellationToken = default)
    {
        const double earthRadiusKm = 6371.0;

        var locations = await _context.Locations
            .Where(l => l.IsActive && l.Latitude.HasValue && l.Longitude.HasValue)
            .ToListAsync(cancellationToken);

        var nearbyLocations = locations
            .Where(l =>
            {
                var lat1Rad = ToRadians(latitude);
                var lat2Rad = ToRadians(l.Latitude!.Value);
                var deltaLat = ToRadians(l.Latitude!.Value - latitude);
                var deltaLon = ToRadians(l.Longitude!.Value - longitude);

                var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                        Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                        Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                var distance = earthRadiusKm * c;

                return distance <= radiusKm;
            })
            .OrderBy(l =>
            {
                var lat1Rad = ToRadians(latitude);
                var lat2Rad = ToRadians(l.Latitude!.Value);
                var deltaLat = ToRadians(l.Latitude!.Value - latitude);
                var deltaLon = ToRadians(l.Longitude!.Value - longitude);

                var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                        Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                        Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

                var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
                return earthRadiusKm * c;
            })
            .ToList();

        return nearbyLocations;
    }

    /// <summary>
    /// Gets location by slug
    /// </summary>
    public async Task<Location?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive && l.Name.ToLower() == slug.ToLower())
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Gets all active locations
    /// </summary>
    public async Task<IEnumerable<Location>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Locations
            .Where(l => l.IsActive)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Helper method to convert degrees to radians
    /// </summary>
    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }
}
