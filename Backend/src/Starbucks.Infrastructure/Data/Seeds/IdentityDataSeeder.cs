using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Utilities;
using Starbucks.Domain.Identity;

namespace Starbucks.Infrastructure.Data.Seeds;

/// <summary>
/// Seeds initial Identity data including roles and admin user
/// </summary>
public class IdentityDataSeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ILogger<IdentityDataSeeder> _logger;

    public IdentityDataSeeder(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger<IdentityDataSeeder> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    /// <summary>
    /// Seeds roles and admin user if they don't exist
    /// </summary>
    public async Task SeedAsync()
    {
        await SeedRolesAsync();
        await SeedAdminUserAsync();
    }

    /// <summary>
    /// Seeds application roles
    /// </summary>
    private async Task SeedRolesAsync()
    {
        var roles = new[]
        {
            new ApplicationRole("Customer")
            {
                Description = "Regular customer with ordering privileges",
                Priority = 0,
                IsSystemRole = true
            },
            new ApplicationRole("Employee")
            {
                Description = "Store employee with order management access",
                Priority = 1,
                IsSystemRole = true
            },
            new ApplicationRole("Manager")
            {
                Description = "Store manager with staff and inventory management",
                Priority = 2,
                IsSystemRole = true
            },
            new ApplicationRole("Admin")
            {
                Description = "System administrator with full access",
                Priority = 3,
                IsSystemRole = true
            },
            new ApplicationRole("SuperAdmin")
            {
                Description = "Super administrator with unrestricted access",
                Priority = 4,
                IsSystemRole = true
            }
        };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role.Name!))
            {
                role.CreatedAt = DateTime.UtcNow;
                role.CreatedBy = "System";
                
                var result = await _roleManager.CreateAsync(role);
                
                if (result.Succeeded)
                {
                    _logger.LogInformation("Created role: {RoleName}", role.Name);
                }
                else
                {
                    _logger.LogError("Failed to create role {RoleName}: {Errors}",
                        role.Name,
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    /// <summary>
    /// Seeds default admin user
    /// </summary>
    private async Task SeedAdminUserAsync()
    {
        const string adminEmail = "admin@starbucks.eg";
        const string adminPassword = "Admin@123456"; // Change in production!
        
        var existingAdmin = await _userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin != null)
        {
            _logger.LogInformation("Admin user already exists");
            return;
        }

        var adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
            FirstName = "System",
            LastName = "Administrator",
            PhoneNumber = "+201000000000",
            PhoneNumberConfirmed = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        var createResult = await _userManager.CreateAsync(adminUser, adminPassword);
        
        if (createResult.Succeeded)
        {
            _logger.LogInformation("Created admin user: {Email}", PiiGuard.MaskEmail(adminEmail));
            
            // Add to SuperAdmin role
            var roleResult = await _userManager.AddToRoleAsync(adminUser, "SuperAdmin");
            
            if (roleResult.Succeeded)
            {
                _logger.LogInformation("Added admin user to SuperAdmin role");
            }
            else
            {
                _logger.LogError("Failed to add admin user to role: {Errors}",
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            _logger.LogError("Failed to create admin user: {Errors}",
                string.Join(", ", createResult.Errors.Select(e => e.Description)));
        }
    }

    /// <summary>
    /// Seeds test users for development (call this only in development environment)
    /// </summary>
    public async Task SeedTestUsersAsync()
    {
        var testUsers = new[]
        {
            new
            {
                Email = "customer@test.com",
                Password = "Test@123456",
                FirstName = "Test",
                LastName = "Customer",
                Role = "Customer"
            },
            new
            {
                Email = "employee@test.com",
                Password = "Test@123456",
                FirstName = "Test",
                LastName = "Employee",
                Role = "Employee"
            },
            new
            {
                Email = "manager@test.com",
                Password = "Test@123456",
                FirstName = "Test",
                LastName = "Manager",
                Role = "Manager"
            }
        };

        foreach (var testUser in testUsers)
        {
            var existingUser = await _userManager.FindByEmailAsync(testUser.Email);
            if (existingUser != null) continue;

            var user = new ApplicationUser
            {
                UserName = testUser.Email,
                Email = testUser.Email,
                EmailConfirmed = true,
                FirstName = testUser.FirstName,
                LastName = testUser.LastName,
                PhoneNumber = $"+2010{Random.Shared.Next(10000000, 99999999)}",
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            };

            var result = await _userManager.CreateAsync(user, testUser.Password);
            
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, testUser.Role);
                _logger.LogInformation("Created test user: {Email} with role {Role}", 
                    testUser.Email, testUser.Role);
            }
        }
    }
}
