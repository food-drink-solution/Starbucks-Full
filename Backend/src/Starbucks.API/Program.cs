using Serilog;
using Starbucks.API.Configuration;
using Starbucks.API.Extensions;
using Starbucks.Infrastructure.Data;
using Starbucks.Infrastructure.Data.Seeds;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Starbucks.Domain.Identity;

// ── Bootstrap logger (before host builds, so startup errors are captured) ────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Configure Key Vault for production ────────────────────────────────────
    builder.Configuration.AddKeyVaultConfiguration(builder.Environment);

    // ── Serilog reads full config from appsettings.json / environment ─────────
    builder.AddSerilogConfiguration();

    // ── Service registration (grouped by concern) ─────────────────────────────
    builder.Services.AddApplicationServices(builder.Configuration);
    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationFeatures();
    
    // ── Add Identity and OAuth configuration ─────────────────────────────────
    builder.Services.AddIdentityConfiguration(builder.Configuration);
    builder.Services.AddOAuthProviders(builder.Configuration);

    var app = builder.Build();

    // ── Middleware pipeline (order matters) ───────────────────────────────────
    app.UseCorrelationId();                 // correlation ID first for tracing
    app.UseResponseCompression();           // compress responses early
    app.UseResponseCaching();               // response caching after compression
    app.UseGlobalExceptionHandler();        // must be early — catches everything below
    app.UseRequestLocalization();           // handle culture early for localized responses
    app.UseSecurityHeaders();
    if (app.Configuration.GetValue<bool>("EnableHttpsRedirection", false))
    {
        app.UseHttpsRedirection();
    }
    app.UseStaticFiles();                   // serve static files from wwwroot (images, etc.)
    app.UseCors(CorsConfiguration.AllowFrontendPolicy);
    AspNetCoreRateLimit.StartupExtensions.UseIpRateLimiting(app);
    app.UseSerilogRequestLogging();         // structured request logs
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Routes ────────────────────────────────────────────────────────────────
    app.MapControllers();
    app.MapHealthCheckEndpoints();
    app.UseSwaggerUI();

    Log.Information("Starting Starbucks Egypt API in {Environment}", app.Environment.EnvironmentName);

    // ── Database Initialization & Identity Seeding ────────────────────────────
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var seederLogger = scope.ServiceProvider.GetRequiredService<ILogger<IdentityDataSeeder>>();

            if (app.Environment.IsDevelopment())
            {
                // Development: create schema directly
                await context.Database.EnsureCreatedAsync();
                
                // Seed Identity data (roles and admin user)
                var identitySeeder = new IdentityDataSeeder(userManager, roleManager, seederLogger);
                await identitySeeder.SeedAsync();
                await identitySeeder.SeedTestUsersAsync();
                
                // Seed other data
                await DataSeeder.SeedAsync(context);
            }
            else
            {
                // Production / Staging: apply any pending EF migrations automatically
                Log.Information("Applying EF Core migrations if pending...");
                await context.Database.MigrateAsync();
                Log.Information("EF Core migrations applied successfully.");
                
                // Seed Identity roles and default admin user
                var identitySeeder = new IdentityDataSeeder(userManager, roleManager, seederLogger);
                await identitySeeder.SeedAsync();

                // Seed catalog data (categories, items, locations) if empty
                await DataSeeder.SeedAsync(context);
                Log.Information("Database seeding completed.");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred during database migration or seeding: {Message}", ex.Message);
        }
    }


    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
