namespace JobApplicationTrackerApi.DTO.Auth;
/// <summary>
/// Response model containing authenticated user information and tokens.
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Unique identifier for the authenticated user.
    /// </summary>
    public string Id { get; init; }
    
    /// <summary>
    /// Email address of the authenticated user.
    /// </summary>
    public string? Email { get; init; }
    
    /// <summary>
    /// First name of the authenticated user.
    /// </summary>
    public string? FirstName { get; init; } 
    
    /// <summary>
    /// Last name of the authenticated user.
    /// </summary>
    public string? LastName { get; init; } 
    
    /// <summary>
    /// JWT access token for authenticating API requests.
    /// </summary>
    public string? AccessToken { get; init; } 
    
    /// <summary>
    /// Refresh token used to obtain new access tokens when they expire.
    /// </summary>
    public string? RefreshToken { get; init; } 
}