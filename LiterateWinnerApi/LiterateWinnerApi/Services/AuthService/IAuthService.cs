using JobApplicationTrackerApi.DTO.Auth;

namespace JobApplicationTrackerApi.Services.AuthService;

/// <summary>
/// Interface for authentication and user account management operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user account.
    /// </summary>
    /// <param name="email">The user's email address</param>
    /// <param name="password">The user's password</param>
    /// <param name="firstName">The user's first name</param>
    /// <param name="lastName">The user's last name</param>
    /// <param name="role">The user's role</param>
    /// <returns>AuthResponseDto with user details and tokens if successful, null otherwise</returns>
    Task<AuthResponseDto?> RegisterUserAsync(string email, string password, string firstName, string lastName, string? role = null);

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    /// <param name="email">The user's email address</param>
    /// <param name="password">The user's password</param>
    /// <returns>AuthResponseDto with user details and tokens if successful, null otherwise</returns>
    Task<AuthResponseDto?> LoginUserAsync(string email, string password);
    
    /// <summary>
    /// Refreshes an expired access token using a valid refresh token.
    /// </summary>
    /// <param name="accessToken">The expired or expiring access token</param>
    /// <param name="refreshToken">The refresh token</param>
    /// <returns>AuthResponseDto with new tokens if successful, null otherwise</returns>
    Task<AuthResponseDto?> RefreshTokenAsync(string accessToken);

    /// <summary>
    /// Logs out a user by invalidating their refresh token.
    /// </summary>
    /// <param name="userId">The user's ID</param>
    /// <returns>AuthResponseDto with user details if successful, null otherwise</returns>
    Task<AuthResponseDto?> LogoutAsync(string userId);
}