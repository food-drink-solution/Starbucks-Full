using MediatR;
using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Data;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Orders;
using Starbucks.Domain.Entities;
using Starbucks.Domain.Enums;
using Mapster;

namespace Starbucks.Application.Features.Orders.Commands;

public record CreateOrderCommand(CreateOrderRequestDto Request) : IRequest<Result<OrderDto>>;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IDateTimeService _dateTime;
    private readonly ISettingsService _settings;
    private readonly IEmailService _email;

    public CreateOrderCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IDateTimeService dateTime,
        ISettingsService settings,
        IEmailService email)
    {
        _context = context;
        _currentUserService = currentUserService;
        _dateTime = dateTime;
        _settings = settings;
        _email = email;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
        {
            return Result<OrderDto>.Failure("User must be authenticated to place an order.");
        }

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Request.Items)
        {
            var menuItem = await _context.MenuItems
                .Include(m => m.Variants)
                .FirstOrDefaultAsync(m => m.Id == item.MenuItemId, cancellationToken);

            if (menuItem == null)
            {
                return Result<OrderDto>.Failure($"Menu item {item.MenuItemId} not found.");
            }

            decimal unitPrice = menuItem.Price;
            if (item.VariantId.HasValue)
            {
                var variant = menuItem.Variants.FirstOrDefault(v => v.Id == item.VariantId.Value);
                if (variant != null)
                {
                    unitPrice += variant.PriceAdjustment;
                }
            }

            var totalPrice = unitPrice * item.Quantity;
            subtotal += totalPrice;

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = item.MenuItemId,
                VariantId = item.VariantId,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice,
                SpecialInstructions = item.SpecialInstructions,
                Customizations = item.Customizations,
                CreatedAt = _dateTime.UtcNow
            });
        }

        var taxRate = await _settings.GetDecimalSettingAsync("TaxRate", 0.14m);
        var deliveryFee = await _settings.GetDecimalSettingAsync("DeliveryFee", 15m);
        
        var tax = subtotal * taxRate;
        var total = subtotal + tax + (request.Request.Type == OrderType.Delivery ? deliveryFee : 0m);

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = _currentUserService.UserId.Value,
            LocationId = request.Request.LocationId,
            OrderNumber = "SBX-" + _dateTime.UtcNow.Ticks.ToString().Substring(10),
            Status = OrderStatus.Pending,
            Type = request.Request.Type,
            Subtotal = subtotal,
            Tax = tax,
            Total = total,
            PaymentMethod = request.Request.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            Notes = request.Request.Notes,
            DeliveryAddress = request.Request.DeliveryAddress,
            DeliveryPhoneNumber = request.Request.DeliveryPhoneNumber,
            Items = orderItems,
            CreatedAt = _dateTime.UtcNow
        };

        // Reward Points calculation: configurable ratio
        var pointsRatio = await _settings.GetDecimalSettingAsync("PointsRatio", 10m);
        int pointsEarned = (int)(total / pointsRatio);
        order.PointsEarned = pointsEarned;

        _context.Orders.Add(order);

        // Update User Profile Reward Points
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == _currentUserService.UserId.Value, cancellationToken);
        if (profile != null)
        {
            profile.RewardPoints += pointsEarned;
            profile.TotalPointsEarned += pointsEarned;
            profile.LastPointsActivity = _dateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Send confirmation email (async/fire-and-forget or background job would be better, but keeping it simple here)
        var user = await _context.Users.FindAsync(new object[] { _currentUserService.UserId.Value }, cancellationToken);
        if (user != null && !string.IsNullOrEmpty(user.Email))
        {
            await _email.SendOrderConfirmationAsync(user.Email, order.OrderNumber, order.Total, cancellationToken);
        }

        return Result<OrderDto>.Success(order.Adapt<OrderDto>());
    }
}
