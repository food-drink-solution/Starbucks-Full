using MediatR;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Abstractions;
using Starbucks.Application.Common.Extensions;
using Starbucks.Application.Common.Interfaces.Data;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Application.Common.Utilities;
using Starbucks.Application.DTOs.Locations;
using Mapster;

namespace Starbucks.Application.Features.Locations.Queries;

public record GetNearbyLocationsQuery(
    double Latitude,
    double Longitude,
    double Radius = 10,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<Result<PagedResult<LocationDto>>>;

public class GetNearbyLocationsQueryHandler : CachedPagedQueryHandler<GetNearbyLocationsQuery, LocationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetNearbyLocationsQueryHandler> _logger;

    public GetNearbyLocationsQueryHandler(
        IUnitOfWork unitOfWork,
        IDistributedCacheService cacheService,
        ILogger<GetNearbyLocationsQueryHandler> logger)
        : base(cacheService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    protected override string GenerateCacheKey(GetNearbyLocationsQuery request)
        => CacheKeyGenerator.NearbyLocations(request.Latitude, request.Longitude, request.Radius, request.PageNumber, request.PageSize);

    protected override TimeSpan GetCacheDuration() => TimeSpan.FromMinutes(30);

    protected override async Task<Result<PagedResult<LocationDto>>> ExecuteQueryAsync(
        GetNearbyLocationsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // STEP 1: Validate coordinates
            var coordinatesValidation = ValidationExtensions.ValidateCoordinates(request.Latitude, request.Longitude);
            if (!coordinatesValidation.IsSuccess)
                return Result<PagedResult<LocationDto>>.Failure(coordinatesValidation.Errors.First());

            // STEP 2: Validate radius
            var radiusValidation = ValidationExtensions.ValidateRadiusParameter(request.Radius);
            if (!radiusValidation.IsSuccess)
                return Result<PagedResult<LocationDto>>.Failure(radiusValidation.Errors.First());

            // STEP 3: Validate pagination parameters
            var paginationValidation = ValidationExtensions.ValidatePaginationParameters(request.PageNumber, request.PageSize);
            if (!paginationValidation.IsSuccess)
                return Result<PagedResult<LocationDto>>.Failure(paginationValidation.Errors.First());

            // STEP 4: Get nearby locations using repository method
            var nearbyLocations = await _unitOfWork.Locations.GetNearbyAsync(
                request.Latitude,
                request.Longitude,
                request.Radius,
                cancellationToken
            );

            var locationList = nearbyLocations.ToList();

            if (!locationList.Any())
            {
                _logger.LogWarning(
                    "No locations found within {Radius} km of coordinates ({CoordBucket})",
                    request.Radius,
                    PiiGuard.HashCoordinates(request.Latitude, request.Longitude)
                );
                return Result<PagedResult<LocationDto>>.Failure(
                    $"No locations found within {request.Radius} km of the specified coordinates"
                );
            }

            // STEP 5: Get total count
            var totalCount = locationList.Count;

            // STEP 6: Apply pagination
            var paginatedLocations = locationList
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            // STEP 7: Map to DTOs
            var locationDtos = paginatedLocations.Adapt<List<LocationDto>>();

            // STEP 8: Create paged result
            var pagedResult = PagedResult<LocationDto>.Create(
                locationDtos,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            _logger.LogInformation(
                "Nearby locations retrieved successfully: {Count} locations within {Radius} km, Page {PageNumber}/{TotalPages}",
                locationDtos.Count,
                request.Radius,
                request.PageNumber,
                pagedResult.TotalPages
            );

            return Result<PagedResult<LocationDto>>.Success(pagedResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetNearbyLocationsQueryHandler");
            return Result<PagedResult<LocationDto>>.Failure("An error occurred while retrieving nearby locations");
        }
    }
}
