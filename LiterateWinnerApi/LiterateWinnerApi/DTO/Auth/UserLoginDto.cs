namespace JobApplicationTrackerApi.DTO.Auth;

/// <summary>
/// Data transfer object for user login requests.
/// </summary>
public sealed record UserLoginDto
{
    /// <summary>
    /// Email address of the user attempting to log in.
    /// </summary>
    public string Email { get; init; }
    
    /// <summary>
    /// Password for authentication.
    /// </summary>
    public string Password { get; init; }
}