using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Starbucks.Application.Common.Interfaces.Services;
using Starbucks.Application.Common.Utilities;

namespace Starbucks.Infrastructure.Services;

/// <summary>
/// Email service stub.
/// Replace with SendGrid / Mailgun / SES in production by swapping this implementation.
/// The interface contract in Application layer never changes.
/// </summary>
public sealed class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task SendEmailVerificationAsync(string toEmail, string firstName, string token, CancellationToken cancellationToken = default)
    {
        // Never log verification/reset tokens — they grant account access (CodeQL: exposure of sensitive information)
        _logger.LogInformation("[EMAIL] Verification -> {Email}", PiiGuard.MaskEmail(toEmail));
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string toEmail, string firstName, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL] PasswordReset -> {Email}", PiiGuard.MaskEmail(toEmail));
        return Task.CompletedTask;
    }

    public Task SendWelcomeAsync(string toEmail, string firstName, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL] Welcome -> {Email}", PiiGuard.MaskEmail(toEmail));
        return Task.CompletedTask;
    }

    public Task SendContactFormConfirmationAsync(string toEmail, string name, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL] ContactConfirmation -> {Email}", PiiGuard.MaskEmail(toEmail));
        return Task.CompletedTask;
    }

    public Task SendContactFormNotificationAsync(string name, string email, string subject, string message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL] ContactNotification from {Email} subject={Subject}",
            PiiGuard.MaskEmail(email), PiiGuard.SanitizeLogValue(subject));
        return Task.CompletedTask;
    }

    public Task SendOrderConfirmationAsync(string toEmail, string orderNumber, decimal totalAmount, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[EMAIL] OrderConfirmation -> {Email} order={OrderNumber} total={TotalAmount}",
            PiiGuard.MaskEmail(toEmail), orderNumber, totalAmount);
        return Task.CompletedTask;
    }

    public Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        // Do not log the recipient address or message body (personal data)
        _logger.LogInformation("[EMAIL] SendEmail -> {Email} subject={Subject}",
            PiiGuard.MaskEmail(toEmail), PiiGuard.SanitizeLogValue(subject));
        return Task.CompletedTask;
    }
}
