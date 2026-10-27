using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Starbucks.Application.Common.Interfaces.Data;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Domain.Identity;
using System.Security.Cryptography;

namespace Starbucks.Application.Features.Admin.Users.Commands;

public record ResetPasswordCommand(Guid UserId) : IRequest<Result<ResetPasswordResponse>>;

public class ResetPasswordResponse
{
    public string TemporaryPassword { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<ResetPasswordResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IDateTimeService _dateTime;
    private readonly IAuditService _auditService;

    public ResetPasswordCommandHandler(
        UserManager<ApplicationUser> userManager,
        IDateTimeService dateTime,
        IAuditService auditService)
    {
        _userManager = userManager;
        _dateTime = dateTime;
        _auditService = auditService;
    }

    public async Task<Result<ResetPasswordResponse>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());

        if (user == null || user.IsDeleted)
        {
            return Result<ResetPasswordResponse>.Failure("User not found.");
        }

        // Generate temporary password
        var temporaryPassword = GenerateTemporaryPassword();

        // Use UserManager to set password (handles hashing internally)
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, temporaryPassword);

        if (!result.Succeeded)
        {
            return Result<ResetPasswordResponse>.Failure($"Failed to reset password: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        user.UpdatedAt = _dateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Create audit log
        await _auditService.LogActionAsync(
            userId: Guid.Empty,
            action: "RESET_PASSWORD",
            entityType: "User",
            entityId: user.Id,
            oldValues: null,
            newValues: new { Message = "Password reset by admin" },
            cancellationToken: cancellationToken
        );

        return Result<ResetPasswordResponse>.Success(new ResetPasswordResponse
        {
            TemporaryPassword = temporaryPassword,
            Message = $"Password reset successfully. Temporary password: {temporaryPassword}. User should change it on next login."
        });
    }

    private static string GenerateTemporaryPassword()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        // Cryptographically secure RNG — temporary passwords are security credentials
        // (CodeQL: cs/insecure-randomness). System.Random is predictable and seeded
        // from the clock; RandomNumberGenerator is seeded from OS entropy.
        var password = new string(Enumerable.Range(0, 12)
            .Select(_ => chars[RandomNumberGenerator.GetInt32(chars.Length)])
            .ToArray());
        return password;
    }
}
