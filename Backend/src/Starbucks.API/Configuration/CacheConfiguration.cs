using StackExchange.Redis;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Infrastructure.Services;

namespace Starbucks.API.Configuration;

/// <summary>
/// Extension methods for configuring caching with Redis (or in-memory fallback).
/// </summary>
public static class CacheConfiguration
{
    /// <summary>
    /// Adds Redis if a connection string is configured; otherwise falls back to in-memory cache.
    /// This allows the app to run locally without Redis installed.
    /// </summary>
    public static IServiceCollection AddRedisConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var redisConnection = configuration.GetConnectionString("Redis");

        if (!string.IsNullOrWhiteSpace(redisConnection) &&
            !redisConnection.Contains("YOUR_REDIS", StringComparison.OrdinalIgnoreCase) &&
            !redisConnection.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase))
        {
            // Redis is configured — use it as the distributed cache
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var configOptions = ConfigurationOptions.Parse(redisConnection);

                configOptions.ConnectRetry = 3;
                configOptions.ConnectTimeout = 5000;
                configOptions.SyncTimeout = 5000;
                configOptions.AsyncTimeout = 5000;
                configOptions.AbortOnConnectFail = false;
                configOptions.KeepAlive = 60;
                configOptions.ReconnectRetryPolicy = new ExponentialRetry(5000);

                return ConnectionMultiplexer.Connect(configOptions);
            });

            services.AddStackExchangeRedisCache(opts =>
            {
                opts.Configuration = redisConnection;
                opts.InstanceName = "StarbucksEgypt:";
            });

            services.AddScoped<IDistributedCacheService, CacheService>();
        }
        else
        {
            // No Redis configured — fall back to in-memory (local dev / no-Redis environments)
            services.AddDistributedMemoryCache();
            services.AddSingleton<IDistributedCacheService, InMemoryCacheService>();
        }

        return services;
    }
}
