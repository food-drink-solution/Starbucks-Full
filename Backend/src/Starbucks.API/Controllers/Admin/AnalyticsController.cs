using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Starbucks.Application.Common.Interfaces.Data;
using Microsoft.EntityFrameworkCore;
using Starbucks.Application.DTOs.Admin;
using Starbucks.Domain.Enums;

namespace Starbucks.API.Controllers.Admin;

/// <summary>
/// Admin – Advanced Analytics and Reporting.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/analytics")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AnalyticsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AnalyticsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get aggregated system statistics.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalOrders = await _context.Orders.CountAsync();
        var totalMenuItems = await _context.MenuItems.CountAsync();
        var totalLocations = await _context.Locations.CountAsync();
        var totalRevenue = await _context.Orders
            .Where(o => o.Status == Domain.Enums.OrderStatus.Completed)
            .SumAsync(o => o.Total);

        return Ok(new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalOrders = totalOrders,
            TotalMenuItems = totalMenuItems,
            TotalLocations = totalLocations,
            TotalRevenue = totalRevenue,
            GrowthRate = 12.5m // Placeholder
        });
    }

    [HttpGet("sales")]
    public IActionResult GetSalesAnalytics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        return Ok(new List<object>());
    }

    [HttpGet("users")]
    public IActionResult GetUserAnalytics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        return Ok(new List<object>());
    }

    [HttpGet("orders")]
    public IActionResult GetOrderAnalytics([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        return Ok(new List<object>());
    }

    [HttpGet("locations")]
    public IActionResult GetLocationPerformance()
    {
        return Ok(new List<object>());
    }

    [HttpGet("menu-items")]
    public IActionResult GetMenuItemPopularity()
    {
        return Ok(new List<object>());
    }
}
