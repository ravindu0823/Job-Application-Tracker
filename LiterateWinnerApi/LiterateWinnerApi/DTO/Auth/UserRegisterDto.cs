namespace JobApplicationTrackerApi.DTO.Auth;

/// <summary>
/// Data transfer object for user registration requests.
/// </summary>
public sealed record UserRegisterDto
{
    /// <summary>
    /// First name of the user registering.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Last name of the user registering.
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Email address for the new user account.
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Password for the new user account.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}