using JobApplicationTrackerApi.DTO.Home;

namespace JobApplicationTrackerApi.Services.HomeService;

/// <summary>
/// Service for handling business logic related to the Home controller.
/// </summary>
public interface IHomeService
{
    /// <summary>
    /// Gets the API metadata for the home page.
    /// </summary>
    /// <param name="baseUrl">The base URL of the application.</param>
    /// <returns>A DTO containing API metadata.</returns>
    Task<ApiMetadataDto> GetApiMetadataAsync(string baseUrl);

    /// <summary>
    /// Gets the list of all available API endpoints.
    /// </summary>
    /// <returns>A collection of DTOs representing API endpoints.</returns>
    IEnumerable<ApiEndpointDto> GetApiEndpoints();

    /// <summary>
    /// Performs a health check of the application and its dependencies.
    /// </summary>
    /// <returns>A tuple containing the health report DTO and a boolean indicating if the service is healthy.</returns>
    Task<(HealthReportDto healthReport, bool isHealthy)> GetHealthAsync();

    /// <summary>
    /// Gets the API documentation and usage examples.
    /// </summary>
    /// <param name="baseUrl">The base URL of the application.</param>
    /// <returns>A DTO containing API documentation.</returns>
    ApiDocumentationDto GetApiDocumentation(string baseUrl);
}