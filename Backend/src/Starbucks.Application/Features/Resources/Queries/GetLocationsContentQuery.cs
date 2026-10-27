namespace Starbucks.Application.Features.Resources.Queries;

using MediatR;
using Starbucks.Application.Common.Interfaces.Data;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Resources;

/// <summary>
/// Get all store locations grouped by city
/// 
/// Returns locations with bilingual names and city information
/// 
/// Cache key: resources:locations:{language}
/// </summary>
public record GetLocationsContentQuery(
    string Language = "en"
) : IRequest<Result<LocationsContentDto>>;

public class GetLocationsContentQueryHandler : IRequestHandler<GetLocationsContentQuery, Result<LocationsContentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetLocationsContentQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LocationsContentDto>> Handle(
        GetLocationsContentQuery request,
        CancellationToken cancellationToken)
    {
        var locations = await _unitOfWork.Locations.GetActiveAsync(cancellationToken);

        var dto = new LocationsContentDto
        {
            Cities = locations
                .GroupBy(l => l.City)
                .Select(g => new CityResourceDto
                {
                    Id = g.Key,
                    Name = ResourceMapper.MapPlain(g.Key),
                    StoreCount = g.Count(),
                })
                .OrderBy(c => c.Name.English)
                .ToList(),
            Stores = locations
                .Select(l => new StoreResourceDto
                {
                    Id = l.Id.ToString(),
                    Name = ResourceMapper.Map(l.DisplayName),
                    Address = l.LocalizedAddress is not null
                        ? ResourceMapper.Map(l.LocalizedAddress)
                        : ResourceMapper.MapPlain(l.Address),
                    City = l.City,
                    Phone = l.PhoneNumber ?? string.Empty,
                    Latitude = l.Latitude,
                    Longitude = l.Longitude,
                    Services = BuildServices(l),
                })
                .ToList(),
        };

        return Result<LocationsContentDto>.Success(dto);
    }

    private static List<string>? BuildServices(Domain.Entities.Location location)
    {
        var services = new List<string>();

        if (location.HasWifi)
        {
            services.Add("wifi");
        }

        if (location.HasDriveThru)
        {
            services.Add("drive-thru");
        }

        if (location.HasOutdoorSeating)
        {
            services.Add("outdoor-seating");
        }

        if (location.HasParking)
        {
            services.Add("parking");
        }

        if (location.AcceptsMobileOrders)
        {
            services.Add("mobile-order");
        }

        return services.Count > 0 ? services : null;
    }
}
