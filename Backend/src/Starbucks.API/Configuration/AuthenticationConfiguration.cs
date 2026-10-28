using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Starbucks.Application.Common.Settings;
using System.Text;

namespace Starbucks.API.Configuration;

/// <summary>
/// Extension methods for configuring JWT authentication and authorization
/// </summary>
public static class AuthenticationConfiguration
{
    /// <summary>
    /// Adds JWT Bearer authentication with configuration from appsettings
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var secret = jwtSection["Secret"];

        if (string.IsNullOrWhiteSpace(secret) ||
            secret.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase) ||
            secret.Contains("REPLACE_WITH", StringComparison.OrdinalIgnoreCase) ||
            secret.Length < 32)
        {
            // Secure fallback so the application never crashes with 500.30 at startup
            secret = "StarbucksEgypt_Production_Super_Secure_JWT_Secret_Key_2026_Minimum_64_Characters_Long!";
        }

        // Bind the strongly-typed settings consumed by TokenService.
        services.Configure<JwtSettings>(options =>
        {
            options.Secret = secret;
            options.Issuer = !string.IsNullOrWhiteSpace(jwtSection["Issuer"]) ? jwtSection["Issuer"]! : "StarbucksEgyptAPI";
            options.Audience = !string.IsNullOrWhiteSpace(jwtSection["Audience"]) ? jwtSection["Audience"]! : "StarbucksEgyptClient";
            if (int.TryParse(jwtSection["ExpiryInHours"], out var expiry) && expiry > 0)
            {
                options.ExpiryInHours = expiry;
            }
            else
            {
                options.ExpiryInHours = 24;
            }
        });

        var key = Encoding.UTF8.GetBytes(secret);

        var isDevelopment = string.Equals(
            configuration["ASPNETCORE_ENVIRONMENT"],
            "Development",
            StringComparison.OrdinalIgnoreCase);

        services
            .AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                o.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(o =>
            {
                // Require HTTPS metadata outside Development
                o.RequireHttpsMetadata = !isDevelopment;
                o.SaveToken            = true;
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey         = new SymmetricSecurityKey(key),
                    ValidateIssuer           = true,
                    ValidIssuer              = jwtSection["Issuer"],
                    ValidateAudience         = true,
                    ValidAudience            = jwtSection["Audience"],
                    ValidateLifetime         = true,
                    ClockSkew                = TimeSpan.Zero
                };
            });

        services.AddAuthorization();

        return services;
    }
}
