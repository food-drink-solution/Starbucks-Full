using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Application.Common.Utilities;

namespace Starbucks.Infrastructure.Services;

/// <summary>
/// Implementation of distributed cache service using Redis
/// Handles core cache operations with JSON serialization
/// </summary>
public class CacheService : IDistributedCacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<CacheService> _logger;
    private readonly IDatabase _db;
    private long _hits = 0;
    private long _misses = 0;

    public CacheService(IConnectionMultiplexer redis, ILogger<CacheService> logger)
    {
        _redis = redis;
        _logger = logger;
        _db = redis.GetDatabase();
    }

    /// <summary>
    /// Gets a value from cache with type safety
    /// </summary>
    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var value = await _db.StringGetAsync(key);

            if (value.IsNullOrEmpty)
            {
                Interlocked.Increment(ref _misses);
                _logger.LogDebug($"Cache miss for key: {key}");
                return default;
            }

            Interlocked.Increment(ref _hits);
            _logger.LogDebug($"Cache hit for key: {key}");

            return JsonSerializer.Deserialize<T>(value.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving cache for key: {key}");
            return default;
        }
    }

    /// <summary>
    /// Sets a value in cache with optional expiration
    /// </summary>
    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        try
        {
            var serialized = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, serialized, expiration);
            _logger.LogDebug($"Cache set for key: {key}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error setting cache for key: {key}");
        }
    }

    /// <summary>
    /// Removes a single cache entry
    /// </summary>
    public async Task RemoveAsync(string key)
    {
        try
        {
            await _db.KeyDeleteAsync(key);
            _logger.LogDebug($"Cache removed for key: {key}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error removing cache for key: {key}");
        }
    }

    /// <summary>
    /// Removes multiple cache entries by pattern
    /// </summary>
    public async Task RemoveByPatternAsync(string pattern)
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var keys = server.Keys(pattern: pattern).ToArray();

            if (keys.Length > 0)
            {
                await _db.KeyDeleteAsync(keys);
                _logger.LogDebug($"Cache removed {keys.Length} keys matching pattern: {pattern}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error removing cache by pattern: {pattern}");
        }
    }

    /// <summary>
    /// Checks if a cache key exists
    /// </summary>
    public async Task<bool> ExistsAsync(string key)
    {
        try
        {
            return await _db.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error checking cache existence for key: {key}");
            return false;
        }
    }

    /// <summary>
    /// Gets cache performance statistics
    /// </summary>
    public Task<CacheStatistics> GetStatisticsAsync()
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var keys = server.Keys().ToArray();

            var stats = new CacheStatistics
            {
                Hits = _hits,
                Misses = _misses,
                TotalKeys = keys.Length,
                MemoryUsed = 0,
                LastUpdated = DateTime.UtcNow
            };

            return Task.FromResult(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache statistics");
            return Task.FromResult(new CacheStatistics());
        }
    }
}
