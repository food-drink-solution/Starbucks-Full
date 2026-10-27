using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Models;
using Starbucks.Application.DTOs.Auth;
using Starbucks.Application.Common.Utilities;
using Starbucks.Domain.Identity;
using Mapster;

namespace Starbucks.Application.Features.Auth.Commands;

public record LoginCommand(LoginRequest Request) : IRequest<Result<LoginResponse>>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IDateTimeService _dateTime;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IDateTimeService dateTime,
        ILogger<LoginCommandHandler> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // STEP 1: Validate input
            if (string.IsNullOrWhiteSpace(request.Request.Email))
                return Result<LoginResponse>.Failure("Email is required");

            if (string.IsNullOrWhiteSpace(request.Request.Password))
                return Result<LoginResponse>.Failure("Password is required");

            // STEP 2: Find user by email
            var user = await _userManager.FindByEmailAsync(request.Request.Email);
            if (user == null)
            {
                // Mask the email — never log user-provided personal data in clear text
                _logger.LogWarning("Login attempt with non-existent email: {Email}", PiiGuard.MaskEmail(request.Request.Email));
                return Result<LoginResponse>.Failure("Invalid email or password");
            }

            // STEP 3: Use Identity's SignInManager for authentication
            // This handles password verification and lockout automatically
            var result = await _signInManager.PasswordSignInAsync(
                user,
                request.Request.Password,
                isPersistent: false,
                lockoutOnFailure: true);

            if (result.Succeeded)
            {
                // STEP 4: Update last login
                user.LastLoginAt = _dateTime.UtcNow;

                // STEP 5: Generate tokens
                var accessToken = _tokenService.GenerateAccessToken(user);
                var refreshToken = _tokenService.GenerateRefreshToken();

                // STEP 6: Update refresh token
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiry = _dateTime.UtcNow.AddDays(7);
                user.RefreshTokenVersion++;
                user.RefreshTokenIssuedAt = _dateTime.UtcNow;

                // STEP 7: Save changes
                await _userManager.UpdateAsync(user);

                _logger.LogInformation("User logged in successfully: {UserId}", user.Id);

                // STEP 8: Return response
                var response = new LoginResponse
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = _dateTime.UtcNow.AddHours(1),
                    User = user.Adapt<UserDto>()
                };

                return Result<LoginResponse>.Success(response);
            }

            if (result.IsLockedOut)
            {
                var lockoutEnd = await _userManager.GetLockoutEndDateAsync(user);
                var remainingMinutes = lockoutEnd.HasValue
                    ? (int)(lockoutEnd.Value - DateTimeOffset.UtcNow).TotalMinutes
                    : 0;
                _logger.LogWarning("Login attempt on locked account: {UserId}", user.Id);
                return Result<LoginResponse>.Failure($"Account is locked. Try again in {remainingMinutes} minutes");
            }

            if (result.RequiresTwoFactor)
            {
                var preferredProvider = "Email";
                var providers = await _userManager.GetValidTwoFactorProvidersAsync(user);
                if (providers.Contains("Authenticator"))
                {
                    preferredProvider = "Authenticator";
                }
                else if (providers.Contains("Email"))
                {
                    preferredProvider = "Email";
                }
                else if (providers.Count > 0)
                {
                    preferredProvider = providers.First();
                }

                var response = new LoginResponse
                {
                    RequiresTwoFactor = true,
                    UserId = user.Id,
                    PreferredProvider = preferredProvider
                };
                return Result<LoginResponse>.Success(response);
            }

            _logger.LogWarning("Failed login attempt for: {Email}", request.Request.Email);
            return Result<LoginResponse>.Failure("Invalid email or password");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in LoginCommandHandler");
            return Result<LoginResponse>.Failure("An error occurred during login");
        }
    }
}
