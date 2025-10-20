using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using JobApplicationTrackerApi.Infrastructure;
using JobApplicationTrackerApi.Infrastructure.Options;
using JobApplicationTrackerApi.Services.TokenService.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace JobApplicationTrackerApi.Services.TokenService;

/// <inheritdoc />
public class TokenService(
    IOptions<JwtOptions> jwtOptions,
    ILogger<TokenService> logger
) : ITokenService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    /// <inheritdoc />
    public string GenerateAccessToken(JwtUser user)
    {
        try
        {
            logger.LogInformation("Generating access token for user {UserId}", user.Id);
            var now = DateTime.UtcNow;
            var secret = Encoding.UTF8.GetBytes(_jwtOptions.SecurityKey);

            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.Id),
                new (ClaimTypes.NameIdentifier, user.Id)
            };

            if (user.Roles != null && user.Roles.Any())
            {
                logger.LogInformation("Adding {RoleCount} roles to token for user {UserId}",
                    user.Roles.Count(), user.Id);
                claims.AddRange(user.Roles.Select(role => new Claim(ClaimTypes.Role, role)));
            }

            if (user.CustomClaims != null && user.CustomClaims.Count != 0)
            {
                logger.LogInformation("Adding {ClaimCount} custom claims to token for user {UserId}",
                    user.CustomClaims.Count, user.Id);
                claims.AddRange(user.CustomClaims.Select(kv => new Claim(kv.Key, kv.Value)));
            }

            // ---------- lifetime ---------- (If you need to create a JWT token with No expiration time, you can set the expiration date to a far future date)
            var isAdminUser = user.Roles?.Any(r => string.Equals(r, Roles.Admin)) == true;

            if (isAdminUser)
            {
                logger.LogInformation("User {UserId} is an IBE user, setting token to never expire", user.Id);
            }
            else
            {
                logger.LogInformation(
                    "User {UserId} is not an IBE user, setting token to expire in {Lifetime} minutes",
                    user.Id, _jwtOptions.AccessTokenLifetime.TotalMinutes);
            }

            // Set the token expiration time
            DateTime? expires = isAdminUser
                ? DateTime.MaxValue // Token will never expire
                : now.Add(_jwtOptions.AccessTokenLifetime);

            // var expires = now.Add(_jwtOptions.AccessTokenLifetime);

            // Create the token
            var jwt = new JwtSecurityToken(
                _jwtOptions.Issuer,
                _jwtOptions.Audience,
                claims,
                notBefore: now,
                expires: expires,
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(secret),
                    SecurityAlgorithms.HmacSha256)
            );

            var encodedToken = new JwtSecurityTokenHandler().WriteToken(jwt);
            logger.LogInformation("Successfully generated access token for user {UserId}", user.Id);
            return encodedToken;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while generating access token for user {UserId}", user.Id);
            throw;
        }
    }

    /// <inheritdoc />
    public string GenerateRefreshToken()
    {
        try
        {
            logger.LogInformation("Generating refresh token");
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var refreshToken = Convert.ToBase64String(randomNumber);
            logger.LogInformation("Successfully generated refresh token");
            return refreshToken;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while generating refresh token");
            throw;
        }
    }

    /// <inheritdoc />
    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        try
        {
            logger.LogInformation("Getting principal from expired token");
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecurityKey)),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                logger.LogWarning("Invalid token format or algorithm");
                throw new SecurityTokenException("Invalid token");
            }

            logger.LogInformation("Successfully retrieved principal from expired token");
            return principal;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting principal from expired token");
            throw;
        }
    }
}