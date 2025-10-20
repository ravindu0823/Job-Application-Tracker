using System.ComponentModel.DataAnnotations;

namespace JobApplicationTrackerApi.DTO.Auth;

/// <summary>
/// DTO for refreshing authentication tokens
/// </summary>
public class RefreshTokenDto
{
    /// <summary>
    /// The expired or expiring access token
    /// </summary>
    [Required(ErrorMessage = "Access token is required")]
    public string AccessToken { get; set; } = string.Empty;
}