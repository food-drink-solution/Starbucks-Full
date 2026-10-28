using Starbucks.Infrastructure.Data;

namespace Starbucks.API.Configuration;

/// <summary>
/// Extension methods for configuring health checks
/// </summary>
public static class HealthCheckConfiguration
{
    /// <summary>
    /// Adds health checks for database and optionally Redis.
    /// Redis health check is skipped if no Redis connection string is configured.
    /// </summary>
    public static IServiceCollection AddHealthCheckConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var healthChecks = services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>("database", tags: new[] { "ready" });

        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrWhiteSpace(redisConnection) &&
            !redisConnection.Contains("YOUR_REDIS", StringComparison.OrdinalIgnoreCase) &&
            !redisConnection.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase))
        {
            healthChecks.AddRedis(redisConnection, "redis", tags: new[] { "ready" });
        }

        return services;
    }
}
