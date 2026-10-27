using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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
        var secret = jwtSection["Secret"]
            ?? throw new InvalidOperationException(
                "Jwt:Secret is not configured. Set it via environment variable Jwt__Secret, User Secrets, or Key Vault.");

        if (secret.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase) ||
            secret.Contains("REPLACE_WITH", StringComparison.OrdinalIgnoreCase) ||
            secret.Length < 32)
        {
            var env = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
            if (!env.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Jwt:Secret must be a strong secret (>= 32 chars) from environment / Key Vault in non-Development environments.");
            }
        }

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
