using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.DTOs.Auth;
using Starbucks.Application.Common.Utilities;
using Starbucks.Domain.Identity;
using Starbucks.Domain.Entities;
using Mapster;
using System.Security.Claims;

namespace Starbucks.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
[Produces("application/json")]
public class ExternalAuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly ILogger<ExternalAuthController> _logger;

    public ExternalAuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        ILogger<ExternalAuthController> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    /// <summary>
    /// Initiate Google OAuth login
    /// </summary>
    [HttpGet("google-login")]
    [AllowAnonymous]
    public IActionResult GoogleLogin(string returnUrl = "/")
    {
        var redirectUrl = Url.Action(nameof(GoogleCallback), "ExternalAuth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties("Google", redirectUrl);
        return Challenge(properties, "Google");
    }

    /// <summary>
    /// Google OAuth callback
    /// </summary>
    [HttpGet("google-callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GoogleCallback(string returnUrl = "/")
    {
        return await ProcessExternalCallback("Google");
    }

    /// <summary>
    /// Initiate Facebook OAuth login
    /// </summary>
    [HttpGet("facebook-login")]
    [AllowAnonymous]
    public IActionResult FacebookLogin(string returnUrl = "/")
    {
        var redirectUrl = Url.Action(nameof(FacebookCallback), "ExternalAuth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties("Facebook", redirectUrl);
        return Challenge(properties, "Facebook");
    }

    /// <summary>
    /// Facebook OAuth callback
    /// </summary>
    [HttpGet("facebook-callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> FacebookCallback(string returnUrl = "/")
    {
        return await ProcessExternalCallback("Facebook");
    }

    /// <summary>
    /// Initiate Microsoft OAuth login
    /// </summary>
    [HttpGet("microsoft-login")]
    [AllowAnonymous]
    public IActionResult MicrosoftLogin(string returnUrl = "/")
    {
        var redirectUrl = Url.Action(nameof(MicrosoftCallback), "ExternalAuth", new { returnUrl });
        var properties = _signInManager.ConfigureExternalAuthenticationProperties("Microsoft", redirectUrl);
        return Challenge(properties, "Microsoft");
    }

    /// <summary>
    /// Microsoft OAuth callback
    /// </summary>
    [HttpGet("microsoft-callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MicrosoftCallback(string returnUrl = "/")
    {
        return await ProcessExternalCallback("Microsoft");
    }

    private async Task<IActionResult> ProcessExternalCallback(string provider)
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info == null)
        {
            _logger.LogWarning("Error loading external login info for provider {Provider}", provider);
            return BadRequest(new { error = $"Error loading external login information for {provider}" });
        }

        // Sign in the user with this external login provider if user already has a login
        var result = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (result.Succeeded)
        {
            var existingUser = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (existingUser != null)
            {
                var existingTokens = await GenerateTokensForUser(existingUser);
                return Ok(existingTokens);
            }
        }

        if (result.IsLockedOut)
        {
            _logger.LogWarning("User account is locked out via external provider {Provider}", provider);
            return Unauthorized(new { error = "Account is locked" });
        }

        // User doesn't exist, create new user or link to existing user
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            _logger.LogWarning("Email not provided by provider {Provider}", provider);
            return BadRequest(new { error = "Email not provided by provider" });
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // Create new user
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FirstName = info.Principal.FindFirstValue(ClaimTypes.GivenName) ?? info.Principal.FindFirstValue(ClaimTypes.Name) ?? "",
                LastName = info.Principal.FindFirstValue(ClaimTypes.Surname) ?? "",
                CreatedAt = DateTime.UtcNow,
                Profile = new UserProfile
                {
                    PreferredLanguage = "en",
                    Country = "Egypt"
                }
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                _logger.LogError("Failed to create user {Email} via external login", PiiGuard.MaskEmail(email));
                return BadRequest(new { errors = createResult.Errors.Select(e => e.Description) });
            }

            // Add to Customer role
            await _userManager.AddToRoleAsync(user, "Customer");
        }

        // Add external login link to user account
        var addLoginResult = await _userManager.AddLoginAsync(user, info);
        if (!addLoginResult.Succeeded)
        {
            _logger.LogError("Failed to link external login for user {Email}", PiiGuard.MaskEmail(email));
            return BadRequest(new { errors = addLoginResult.Errors.Select(e => e.Description) });
        }

        await _signInManager.SignInAsync(user, isPersistent: false);
        var tokens = await GenerateTokensForUser(user);
        
        return Ok(tokens);
    }

    private async Task<LoginResponse> GenerateTokensForUser(ApplicationUser user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.RefreshTokenVersion++;
        user.LastLoginAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = user.Adapt<UserDto>()
        };
    }
}
