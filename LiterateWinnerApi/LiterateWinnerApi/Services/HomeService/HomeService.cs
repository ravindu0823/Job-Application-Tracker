using JobApplicationTrackerApi.DTO.Home;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.EntityFrameworkCore;

namespace JobApplicationTrackerApi.Services.HomeService;

/// <summary>
/// Implements the business logic for the Home controller.
/// </summary>
public class HomeService(
    IApiDescriptionGroupCollectionProvider apiExplorer,
    IWebHostEnvironment environment,
    DefaultContext context,
    ILogger<HomeService> logger) : IHomeService
{
    private readonly IApiDescriptionGroupCollectionProvider _apiExplorer =
        apiExplorer ?? throw new ArgumentNullException(nameof(apiExplorer));

    private readonly DefaultContext _context =
        context ?? throw new ArgumentNullException(nameof(context));

    private readonly IWebHostEnvironment _environment =
        environment ?? throw new ArgumentNullException(nameof(environment));

    private readonly ILogger<HomeService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Business logic to get API metadata.
    /// </summary>
    public async Task<ApiMetadataDto> GetApiMetadataAsync(string baseUrl)
    {
        var dbStats = await GetDatabaseStatisticsAsync();

        return new ApiMetadataDto
        {
            Name = "Job ApplicationTracker API",
            Version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "1.0.0",
            Environment = _environment.EnvironmentName,
            ServerTimeUtc = DateTime.UtcNow,
            Description = "Comprehensive RESTful API for tracking job applications, interviews, and career management.",
            Framework = "ASP.NET Core 9.0",
            Database = "SQL Server with Entity Framework Core 9.0",
            Features = new[]
            {
                "Job Application Management",
                "Interview Scheduling & Tracking",
                "Notes & Research Management",
                "Contact Management",
                "Document Storage",
                "Status History Tracking",
                "Analytics & Reporting",
                "Email Reminders",
                "Calendar Integration"
            },
            DatabaseStatistics = dbStats,
            Links = new[]
            {
                new ApiLinkDto { Rel = "openapi", Href = $"{baseUrl}/openapi/v1.json", Description = "OpenAPI (JSON)" },
                new ApiLinkDto { Rel = "swagger-ui", Href = $"{baseUrl}/swagger", Description = "Swagger UI" },
                new ApiLinkDto { Rel = "health", Href = $"{baseUrl}/health", Description = "Liveness/Readiness" },
                new ApiLinkDto
                {
                    Rel = "documentation", Href = $"{baseUrl}/api/home/documentation", Description = "API Documentation"
                }
            }
        };
    }

    /// <summary>
    /// Business logic to discover and list all API endpoints.
    /// </summary>
    public IEnumerable<ApiEndpointDto> GetApiEndpoints()
    {
        return _apiExplorer.ApiDescriptionGroups.Items
            .SelectMany(g => g.Items)
            .Where(d => d.RelativePath is not null)
            .Select(d => new ApiEndpointDto
            {
                Controller = d.ActionDescriptor.RouteValues.TryGetValue("controller", out var c) ? c?.ToString() : null,
                Method = d.HttpMethod,
                Path = "/" + d.RelativePath!.TrimStart('/'),
                SupportedResponseTypes = d.SupportedResponseTypes.Select(rt => rt.StatusCode).Distinct().OrderBy(x => x)
            })
            .OrderBy(x => x.Controller)
            .ThenBy(x => x.Path)
            .ThenBy(x => x.Method)
            .ToList();
    }

    /// <summary>
    /// Business logic to perform a health check.
    /// </summary>
    public async Task<(HealthReportDto healthReport, bool isHealthy)> GetHealthAsync()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            var dbStats = await GetDatabaseStatisticsAsync();

            var health = new HealthReportDto
            {
                Status = canConnect ? "Healthy" : "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Uptime = Environment.TickCount64,
                Environment = _environment.EnvironmentName,
                Version = typeof(Program).Assembly.GetName().Version?.ToString() ?? "Unknown",
                MachineName = Environment.MachineName,
                ProcessId = Environment.ProcessId,
                WorkingSet = Environment.WorkingSet,
                ProcessorCount = Environment.ProcessorCount,
                Database = new HealthDatabaseDto
                {
                    Connected = canConnect,
                    Provider = _context.Database.ProviderName,
                    Statistics = dbStats
                }
            };

            return (health, canConnect);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            var errorReport = new HealthReportDto
                { Status = "Unhealthy", Error = ex.Message, Timestamp = DateTime.UtcNow };
            return (errorReport, false);
        }
    }

    /// <summary>
    /// Business logic to get API documentation.
    /// </summary>
    public ApiDocumentationDto GetApiDocumentation(string baseUrl)
    {
        return new ApiDocumentationDto
        {
            Title = "Job Application Tracker API Documentation",
            Version = "1.0.0",
            Description = "A comprehensive API for managing job applications, interviews, and related activities",
            BaseUrl = baseUrl,
            Authentication = new AuthDocumentationDto
            {
                Type = "JWT Bearer Token",
                Description = "All endpoints require authentication except health checks and home page",
                Header = "Authorization: Bearer {token}"
            },
            CommonHeaders = new CommonHeadersDto { ContentType = "application/json", Accept = "application/json" },
            ResponseFormats = new Dictionary<string, ResponseFormatDto>
            {
                { "success", new ResponseFormatDto { StatusCode = 200, Description = "Request successful" } },
                { "created", new ResponseFormatDto { StatusCode = 201, Description = "Resource created successfully" } },
                { "noContent", new ResponseFormatDto { StatusCode = 204, Description = "Request successful, no content returned" } },
                { "badRequest", new ResponseFormatDto { StatusCode = 400, Description = "Invalid request data" } },
                { "unauthorized", new ResponseFormatDto { StatusCode = 401, Description = "Authentication required" } },
                { "forbidden", new ResponseFormatDto { StatusCode = 403, Description = "Access denied" } },
                { "notFound", new ResponseFormatDto { StatusCode = 404, Description = "Resource not found" } },
                { "internalServerError", new ResponseFormatDto { StatusCode = 500, Description = "Internal server error" } }
            },
            // Example requests and other static data can be expanded here
        };
    }

    /// <summary>
    /// Business logic to get database statistics.
    /// </summary>
    private async Task<DatabaseStatisticsDto> GetDatabaseStatisticsAsync()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (!canConnect)
            {
                return new DatabaseStatisticsDto { Connected = false, Message = "Database unavailable" };
            }

            return new DatabaseStatisticsDto
            {
                Connected = true,
                Provider = _context.Database.ProviderName,
                Statistics = new DbTableStatsDto
                {
                    Applications = await _context.Applications.CountAsync(),
                    Interviews = await _context.Interviews.CountAsync(),
                    Notes = await _context.Notes.CountAsync(),
                    Contacts = await _context.Contacts.CountAsync(),
                    Documents = await _context.Documents.CountAsync(),
                    StatusHistory = await _context.StatusHistory.CountAsync()
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get database statistics");
            return new DatabaseStatisticsDto { Connected = false, Error = ex.Message };
        }
    }
}