using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Starbucks.Domain.Identity;
using Starbucks.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;

namespace Starbucks.API.Configuration;

/// <summary>
/// Extension methods for configuring ASP.NET Core Identity with OAuth providers
/// </summary>
public static class IdentityConfiguration
{
    /// <summary>
    /// Adds Identity configuration with custom user and role classes
    /// </summary>
    public static IServiceCollection AddIdentityConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var isDevelopment = string.Equals(
            configuration["ASPNETCORE_ENVIRONMENT"],
            "Development",
            StringComparison.OrdinalIgnoreCase);

        // Configure Identity with custom user and role
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            // Password settings - secure but not overly restrictive
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
            options.Password.RequiredUniqueChars = 1;
            
            // Lockout settings - protect against brute force
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
            
            // User settings
            options.User.RequireUniqueEmail = true;
            options.User.AllowedUserNameCharacters = 
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
            
            // Sign-in settings
            // Require confirmed email in Production; allow bypass only in Development until email service is fully integrated
            options.SignIn.RequireConfirmedEmail = !isDevelopment;
            options.SignIn.RequireConfirmedPhoneNumber = false;
            options.SignIn.RequireConfirmedAccount = !isDevelopment;
            
            // Token settings
            options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
            options.Tokens.PasswordResetTokenProvider = TokenOptions.DefaultEmailProvider;
            options.Tokens.EmailConfirmationTokenProvider = TokenOptions.DefaultEmailProvider;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();
        
        // Configure cookie settings for OAuth
        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromHours(1);
            options.SlidingExpiration = true;
            
            // Redirect to API endpoints (for SPA)
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });
        
        return services;
    }
    
    /// <summary>
    /// Adds OAuth authentication providers (Google, Facebook, Microsoft)
    /// </summary>
    public static AuthenticationBuilder AddOAuthProviders(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var authBuilder = services.AddAuthentication();
        
        // Google OAuth
        var googleClientId = configuration["Authentication:Google:ClientId"];
        var googleClientSecret = configuration["Authentication:Google:ClientSecret"];
        
        if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
        {
            authBuilder.AddGoogle(options =>
            {
                options.ClientId = googleClientId;
                options.ClientSecret = googleClientSecret;
                options.CallbackPath = "/api/v1/auth/google-callback";
                
                // Request additional scopes
                options.Scope.Add("profile");
                options.Scope.Add("email");
                
                // Save tokens for later use (optional)
                options.SaveTokens = true;
                
                // Map additional claims
                options.ClaimActions.MapJsonKey("picture", "picture");
                options.ClaimActions.MapJsonKey("locale", "locale");
                
                // Events for logging
                options.Events.OnCreatingTicket = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("Google OAuth: Creating ticket for {Email}", 
                        context.Principal?.FindFirst(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);
                    return Task.CompletedTask;
                };
            });
        }
        
        // Facebook OAuth
        var facebookAppId = configuration["Authentication:Facebook:AppId"];
        var facebookAppSecret = configuration["Authentication:Facebook:AppSecret"];
        
        if (!string.IsNullOrEmpty(facebookAppId) && !string.IsNullOrEmpty(facebookAppSecret))
        {
            authBuilder.AddFacebook(options =>
            {
                options.AppId = facebookAppId;
                options.AppSecret = facebookAppSecret;
                options.CallbackPath = "/api/v1/auth/facebook-callback";
                
                // Request permissions
                options.Scope.Add("email");
                options.Scope.Add("public_profile");
                
                options.SaveTokens = true;
                
                // Request specific fields
                options.Fields.Add("name");
                options.Fields.Add("email");
                options.Fields.Add("picture");
                options.Fields.Add("first_name");
                options.Fields.Add("last_name");
                
                // Map claims
                options.ClaimActions.MapJsonKey("picture", "picture");
                
                options.Events.OnCreatingTicket = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("Facebook OAuth: Creating ticket for {Email}", 
                        context.Principal?.FindFirst(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);
                    return Task.CompletedTask;
                };
            });
        }
        
        // Microsoft OAuth
        var microsoftClientId = configuration["Authentication:Microsoft:ClientId"];
        var microsoftClientSecret = configuration["Authentication:Microsoft:ClientSecret"];
        
        if (!string.IsNullOrEmpty(microsoftClientId) && !string.IsNullOrEmpty(microsoftClientSecret))
        {
            authBuilder.AddMicrosoftAccount(options =>
            {
                options.ClientId = microsoftClientId;
                options.ClientSecret = microsoftClientSecret;
                options.CallbackPath = "/api/v1/auth/microsoft-callback";
                
                // Request scopes
                options.Scope.Add("User.Read");
                options.Scope.Add("email");
                options.Scope.Add("profile");
                
                options.SaveTokens = true;
                
                options.Events.OnCreatingTicket = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("Microsoft OAuth: Creating ticket for {Email}", 
                        context.Principal?.FindFirst(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value);
                    return Task.CompletedTask;
                };
            });
        }
        
        return authBuilder;
    }
}
