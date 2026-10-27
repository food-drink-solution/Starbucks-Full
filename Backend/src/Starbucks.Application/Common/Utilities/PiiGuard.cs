using System.Security.Cryptography;
using System.Text;

namespace Starbucks.Application.Common.Utilities;

/// <summary>
/// Helpers for keeping personal / sensitive data out of logs and external stores.
/// Used to satisfy the CodeQL rules exposure-of-sensitive-information and log-forging:
///  - MaskEmail  : user-provided email addresses must never be logged in clear text
///  - SanitizeLogValue : user-provided values must not be able to forge log lines (CR/LF)
///  - HashCoordinates  : user location must never be written to shared stores in clear text
/// </summary>
public static class PiiGuard
{
    /// <summary>
    /// Masks the local part of an email address: user@example.com -> u***@example.com
    /// </summary>
    public static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "<no-email>";

        var at = email.IndexOf('@');
        if (at <= 0)
            return "***";

        var local = email[..at];
        var domain = email[(at + 1)..];
        var prefix = local.Length > 0 ? local[..1] : "*";
        return $"{prefix}***@{domain}";
    }

    /// <summary>
    /// Strips control characters (including CR/LF and other line breaks) so that
    /// user-provided values cannot forge additional log lines.
    /// </summary>
    public static string SanitizeLogValue(string? value)
        => string.IsNullOrEmpty(value)
            ? string.Empty
            : new string(value.Where(c => !char.IsControl(c)).ToArray());

    /// <summary>
    /// Produces a stable, non-reversible bucket id for a pair of coordinates
    /// (~110m grid at 3 decimals) so raw user location data is never written
    /// to cache stores or logs in clear text.
    /// </summary>
    public static string HashCoordinates(double latitude, double longitude)
    {
        var bytes = Encoding.UTF8.GetBytes(
            FormattableString.Invariant($"{Math.Round(latitude, 3):F3}|{Math.Round(longitude, 3):F3}"));
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash)[..16].ToLowerInvariant();
    }
}
