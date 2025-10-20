using JobApplicationTrackerApi.Enum;
using Microsoft.AspNetCore.Identity;

namespace JobApplicationTrackerApi.Persistence.IdentityContext.Entity;

public sealed class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpireTime { get; set; } = DateTime.UtcNow;
    public DateTime? CreateUtc { get; set; } = DateTime.UtcNow;
    public Guid AccessToken { get; set; } = Guid.NewGuid();
    public DateTime? AccessTokenExpireTime { get; set; } = DateTime.UtcNow.AddHours(1);
    public CommonStatus? Status { get; set; } = CommonStatus.Active;

    // Additional properties
    public string FullName =>  $"{FirstName} {LastName}";
}