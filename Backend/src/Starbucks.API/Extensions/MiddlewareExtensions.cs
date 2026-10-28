using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Starbucks.Application.Common.Utilities;
using System.Text.Json;

namespace Starbucks.API.Extensions;

public static class MiddlewareExtensions
{
    // ─────────────────────────────────────────────────────────────────────────
    // RFC 7807 ProblemDetails — consistent error shape across all endpoints
    // ─────────────────────────────────────────────────────────────────────────
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
                var exception        = exceptionFeature?.Error;

                var logger = context.RequestServices
                    .GetRequiredService<ILogger<Program>>();

                var (statusCode, title, detail, extensions) = exception switch
                {
                    Starbucks.Application.Common.Exceptions.ValidationException valEx => (
                        StatusCodes.Status400BadRequest,
                        "Validation Error",
                        "One or more validation failures occurred.",
                        new Dictionary<string, object?> { ["errors"] = valEx.Errors }
                    ),
                    Starbucks.Application.Common.Exceptions.NotFoundException nfEx => (
                        StatusCodes.Status404NotFound,
                        "Not Found",
                        nfEx.Message,
                        null
                    ),
                    UnauthorizedAccessException => (
                        StatusCodes.Status401Unauthorized,
                        "Unauthorized",
                        "You are not authorized to access this resource.",
                        null
                    ),
                    _ => (
                        StatusCodes.Status500InternalServerError,
                        "An unexpected error occurred.",
                        "Please try again later or contact support.",
                        null
                    )
                };

                // Sanitize user-provided values — CR/LF in a URL must not forge log lines (CodeQL: log-forging)
                var safeMethod = PiiGuard.SanitizeLogValue(context.Request.Method);
                var safePath   = PiiGuard.SanitizeLogValue(context.Request.Path.Value);

                if (statusCode == StatusCodes.Status500InternalServerError)
                {
                    logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                        safeMethod, safePath);
                }
                else
                {
                    logger.LogWarning("Request error on {Method} {Path}: {Title} - {Detail}",
                        safeMethod, safePath, PiiGuard.SanitizeLogValue(title), PiiGuard.SanitizeLogValue(detail));
                }

                context.Response.StatusCode  = statusCode;
                context.Response.ContentType = "application/problem+json";

                var problem = new ProblemDetails
                {
                    Status   = statusCode,
                    Title    = title,
                    Detail   = detail,
                    Instance = context.Request.Path
                };

                if (extensions != null)
                {
                    foreach (var (key, value) in extensions)
                    {
                        problem.Extensions[key] = value;
                    }
                }

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(problem));
            });
        });

        return app;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Security headers — applied to every response
    // ─────────────────────────────────────────────────────────────────────────
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers["X-Content-Type-Options"]  = "nosniff";
            context.Response.Headers["X-Frame-Options"]         = "DENY";
            context.Response.Headers["X-XSS-Protection"]        = "1; mode=block";
            context.Response.Headers["Referrer-Policy"]         = "strict-origin-when-cross-origin";
            context.Response.Headers["Permissions-Policy"]      = "geolocation=(), microphone=(), camera=()";
            
            // HSTS only if request is HTTPS
            if (context.Request.IsHttps)
            {
                context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
            }

            // CSP policy allowing Swagger UI, icons, scripts, and API calls
            context.Response.Headers["Content-Security-Policy"] = 
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
                "style-src 'self' 'unsafe-inline' https:; " +
                "img-src 'self' data: https: http: blob:; " +
                "font-src 'self' data: https:; " +
                "connect-src 'self' https: http: ws: wss:; frame-ancestors 'none';";

            await next();
        });

        return app;
    }
}
