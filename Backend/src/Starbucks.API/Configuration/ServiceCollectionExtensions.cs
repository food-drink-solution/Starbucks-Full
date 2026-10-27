using Starbucks.API.Services;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Infrastructure.Extensions;

namespace Starbucks.API.Configuration;

/// <summary>
/// Orchestrator extension methods that compose focused service registrations
/// This follows the Facade pattern to provide a clean API while maintaining separation of concerns
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers all application-layer services (API, validation, documentation, observability)
    /// </summary>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
            });
        services.AddProblemDetails();

        // File-based localization resources (wwwroot JSON) used by Resources handlers
        services.AddSingleton<ILocalizationResourceProvider, LocalizationResourceProvider>();

        // API Configuration
        services.AddApiVersioningConfiguration();
        services.AddResponseCompressionConfiguration();
        services.AddFluentValidationConfiguration();
        services.AddCorsConfiguration(configuration);
        services.AddSwaggerConfiguration();
        
        // Observability
        services.AddHealthCheckConfiguration(configuration);
        services.AddLocalizationConfiguration();

        return services;
    }

    /// <summary>
    /// Registers all infrastructure services (database, cache, auth, rate limiting, domain services)
    /// </summary>
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Data Access
        services.AddDatabaseConfiguration(configuration);
        services.AddRedisConfiguration(configuration);

        // Security
        services.AddJwtAuthentication(configuration);
        services.AddRateLimitingConfiguration(configuration);

        // Domain Services
        services.AddDomainServices();
        
        // Payment Gateways
        services.AddPaymentServices(configuration);

        return services;
    }

    /// <summary>
    /// Registers application features (MediatR handlers)
    /// </summary>
    public static IServiceCollection AddApplicationFeatures(this IServiceCollection services)
    {
        services.AddMediatRConfiguration();

        return services;
    }
}
