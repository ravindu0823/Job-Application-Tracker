using JobApplicationTrackerApi.DTO.Auth;
using JobApplicationTrackerApi.Infrastructure;
using JobApplicationTrackerApi.Services.AuthService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for authentication and user account management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService authService,
    IIdentityService identityService,
    ILogger<AuthController> logger
) : ControllerBase
{
    private readonly IAuthService _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    private readonly IIdentityService _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
    private readonly ILogger<AuthController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="registerDto">The registration data</param>
    /// <returns>The registered user details with authentication tokens</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto registerDto)
    {
        try
        {
            var result = await _authService.RegisterUserAsync(
                registerDto.Email,
                registerDto.Password,
                registerDto.FirstName,
                registerDto.LastName,
                registerDto.Role
            );
            return CreatedAtAction(nameof(Register), 
                ApiResponse<AuthResponseDto>.Success(result, "User registered successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Registration failed for {Email}", registerDto.Email);
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", registerDto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An error occurred during registration"));
        }
    }
    
    /// <summary>
    /// Register a new administrator account
    /// </summary>
    /// <param name="dto">The registration data for the new administrator</param>
    /// <returns>The registered administrator details with authentication tokens</returns>
    /// <response code="201">Administrator account created successfully</response>
    /// <response code="400">Invalid request data or user already exists</response>
    /// <response code="401">Unauthorized - Authentication token missing or invalid</response>
    /// <response code="403">Forbidden - User does not have Admin role</response>
    /// <response code="500">Internal server error occurred during registration</response>
    [HttpPost("register-admin")]
    [Authorize(Roles = Roles.Admin)] // Only admins can create other admins
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RegisterAdmin([FromBody] UserRegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterUserAsync(
                dto.Email,
                dto.Password,
                dto.FirstName,
                dto.LastName,
                Roles.Admin // Force admin role
            );
            return CreatedAtAction(nameof(Register), 
                ApiResponse<AuthResponseDto>.Success(result, "User registered successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Registration failed for {Email}", dto.Email);
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", dto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An error occurred during registration"));
        }
     
    }
    
    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="loginDto">The login credentials</param>
    /// <returns>User details with authentication tokens</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginUserAsync(loginDto.Email, loginDto.Password);
            return Ok(ApiResponse<AuthResponseDto>.Success(result, "Login successful"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Login failed for {Email}", loginDto.Email);
            return Unauthorized(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", loginDto.Email);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An error occurred during login"));
        }
    }

    /// <summary>
    /// Refresh access token using a valid access token
    /// </summary>
    /// <param name="refreshDto">The refresh token request data</param>
    /// <returns>New authentication tokens</returns>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshDto)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(refreshDto.AccessToken);
            return Ok(ApiResponse<AuthResponseDto>.Success(result, "Token refreshed successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Token refresh failed");
            return Unauthorized(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An error occurred during token refresh"));
        }
    }

    /// <summary>
    /// Logout the current user
    /// </summary>
    /// <returns>Success response</returns>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userId = GetUserId();
            var result = await _authService.LogoutAsync(userId);
            return Ok(ApiResponse<AuthResponseDto>.Success(result, "Logout successful"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized logout attempt");
            return Unauthorized(ApiResponse<object>.Failure(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Logout failed");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.Failure("An error occurred during logout"));
        }
    }
    private string GetUserId()
    {
        var userId = _identityService.GetUserIdentity();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("User ID not found in token claims.");
            throw new UnauthorizedAccessException("User not authenticated or token is invalid.");
        }
        return userId;
    }
}