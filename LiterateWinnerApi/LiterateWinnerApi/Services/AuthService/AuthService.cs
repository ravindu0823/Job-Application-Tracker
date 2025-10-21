using System.Security.Claims;
using AutoMapper;
using JobApplicationTrackerApi.Persistence.IdentityContext;
using JobApplicationTrackerApi.Persistence.IdentityContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using JobApplicationTrackerApi.Services.TokenService;
using JobApplicationTrackerApi.Services.TokenService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobApplicationTrackerApi.DTO.Auth;
using JobApplicationTrackerApi.Infrastructure;

namespace JobApplicationTrackerApi.Services.AuthService;

/// <summary>
/// Service implementation for authentication and user account management operations.
/// </summary>
public class AuthService(
    IdentityContext context,
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenService tokenService,
    ICacheService cacheService,
    ILogger<AuthService> logger,
    IMapper mapper
) : IAuthService
{
    private readonly IdentityContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly UserManager<ApplicationUser> _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    private readonly SignInManager<ApplicationUser> _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
    private readonly ITokenService _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<AuthService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <inheritdoc />
    public async Task<AuthResponseDto?> RegisterUserAsync(string email, string password, string firstName, string lastName, string? role = null)
    {
        try
        {
            _logger.LogInformation("Attempting to register user with email: {Email}", email);

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: User with email {Email} already exists", email);
                throw new InvalidOperationException("Registration failed: User with email already exists");
            }

            // Create new user
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
            };

            var result = await _userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Registration failed for user {Email}: {Errors}",
                    email, string.Join(", ", result.Errors.Select(e => e.Description)));
                throw new InvalidOperationException("Registration failed");
            }
            
            // If role is not specified or invalid, default to "User" role
            var roleToAssign = !string.IsNullOrEmpty(role) && 
                               (role == Roles.Admin || role == Roles.User) 
                ? role 
                : Roles.User;

            var roleResult = await _userManager.AddToRoleAsync(user, roleToAssign);
        
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Failed to assign role {Role} to user {Email}: {Errors}",
                    roleToAssign, email, string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            
                // Rollback: delete the user if role assignment fails
                await _userManager.DeleteAsync(user);
                throw new InvalidOperationException("Registration failed: Unable to assign user role");
            }
            _logger.LogInformation("User {Email} registered successfully", email);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            // Generate tokens using TokenService
            var jwtUser = new JwtUser
            (
                Id: user.Id,
                Roles:roles.ToList()
            );

            var accessToken = _tokenService.GenerateAccessToken(jwtUser);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Store refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while registering user {Email}", email);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<AuthResponseDto?> LoginUserAsync(string email, string password)
    {
        try
        {
            _logger.LogInformation("Attempting login for user: {Email}", email);

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Login failed: User {Email} not found", email);
                throw new InvalidOperationException("Login failed: User not found");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

            if (result.IsLockedOut)
            {
                _logger.LogWarning("Login failed: User {Email} is locked out", email);
                throw new InvalidOperationException("Login failed: User is locked out");
            }

            if (!result.Succeeded)
            {
                _logger.LogWarning("Login failed: Invalid credentials for user {Email}", email);
                throw new InvalidOperationException("Login failed: Invalid credentials");
            }

            _logger.LogInformation("User {Email} logged in successfully", email);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            // Generate tokens using TokenService
            var jwtUser = new JwtUser
            (
                Id: user.Id,
                Roles:roles.ToList()
            );

            var accessToken = _tokenService.GenerateAccessToken(jwtUser);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Store refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while logging in user {Email}", email);
            throw;
        }
    }
    
    /// <inheritdoc />
    public async Task<AuthResponseDto?> RefreshTokenAsync(string accessToken)
    {
        try
        {
            _logger.LogInformation("Attempting to refresh token");

            // Validate the expired access token and get claims
            ClaimsPrincipal principal;
            try
            {
                principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            }
            catch (Exception)
            {
                _logger.LogWarning("Token refresh failed: Invalid access token");
                throw new InvalidOperationException("Token refresh failed: Invalid access_token");
            }

            var userId = principal.Identity?.Name;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Token refresh failed: Unable to extract user ID from token");
                throw new InvalidOperationException("Token refresh failed: Unable to extract user ID from token");
            }

            // Find user by ID and verify refresh token
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId );

            if (user == null)
            {
                _logger.LogWarning("Token refresh failed: Invalid refresh token for user {UserId}", userId);
                throw new InvalidOperationException("Token refresh failed: Invalid refresh_token");
            }

            // Check if refresh token is expired
            if (user.RefreshTokenExpireTime <= DateTime.UtcNow)
            {
                _logger.LogWarning("Token refresh failed: Refresh token expired for user {UserId}", user.Id);
                throw new InvalidOperationException("Token refresh failed: Refresh token expired");
            }

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            // Generate new tokens using TokenService
            var jwtUser = new JwtUser
            (
                Id: user.Id,
                Roles:roles.ToList()
            );

            var newAccessToken = _tokenService.GenerateAccessToken(jwtUser);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Update refresh token
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpireTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Token refreshed successfully for user {UserId}", user.Id);

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while refreshing token");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<AuthResponseDto?> LogoutAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Attempting to logout user: {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Logout failed: User {UserId} not found", userId);
                throw new InvalidOperationException("Logout failed: User not found");
            }

            // Invalidate refresh token
            user.RefreshToken = null;
            user.RefreshTokenExpireTime = null;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Logout failed for user {UserId}: {Errors}",
                    userId, string.Join(", ", result.Errors.Select(e => e.Description)));
                throw new InvalidOperationException("Logout failed");
            }

            // Sign out the user
            await _signInManager.SignOutAsync();

            // Clear cached sessions
            await _cacheService.RemoveAsync($"user_session_{userId}");

            _logger.LogInformation("User {UserId} logged out successfully", userId);

            return new AuthResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = null,
                RefreshToken = null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while logging out user {UserId}", userId);
            throw;
        }
    }
}