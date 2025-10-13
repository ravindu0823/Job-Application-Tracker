using System.Security.Claims;

namespace JobApplicationTrackerApi.Services.IdentityService;

public sealed class IdentityService(IHttpContextAccessor context) : IIdentityService
{
    public string? GetUserIdentity()
    {
        // Use null-conditional operators (?.) for safe navigation.
        // This avoids NullReferenceException if HttpContext, User, or the claim is null.
        return context.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}