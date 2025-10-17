using JobApplicationTrackerApi.DTO.Applications;
using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.Services.ApplicationsService;

/// <summary>
/// Service interface for managing job applications
/// </summary>
public interface IApplicationService
{
    /// <summary>
    /// Gets all applications for a user with optional filtering and pagination
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="priority">Optional priority filter</param>
    /// <param name="searchTerm">Optional search term for company name or position</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="startDate">The start date used to filter applications (optional).</param>
    /// <param name="endDate">The end date used to filter applications (optional).</param>
    /// <param name="sortBy">The field name to sort results by (e.g., "appliedDate" or "status").</param>
    /// <param name="sortOrder">The sort direction, either "asc" for ascending or "desc" for descending.</param>
    /// <returns>Paginated list of applications</returns>
    Task<PaginatedResultDto<ApplicationResponseDto>> GetApplicationsAsync(
        string userId,
        ApplicationStatus? status = null,
        ApplicationPriority? priority = null,
        string? searchTerm = null,
        int pageNumber = 1,
        int pageSize = 10,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? sortBy = "date",
        string? sortOrder = "desc");

    /// <summary>
    /// Gets a single application by ID
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="userId">User identifier</param>
    /// <returns>Application details or null if not found</returns>
    Task<ApplicationResponseDto?> GetApplicationByIdAsync(int id, string userId);

    /// <summary>
    /// Creates a new application
    /// </summary>
    /// <param name="dto">Application creation data</param>
    /// <param name="userId">User identifier</param>
    /// <returns>Created application</returns>
    Task<ApplicationResponseDto> CreateApplicationAsync(CreateApplicationDto dto, string userId);

    /// <summary>
    /// Updates an existing application
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="dto">Application update data</param>
    /// <param name="userId">User identifier</param>
    /// <returns>Updated application or null if not found</returns>
    Task<ApplicationResponseDto?> UpdateApplicationAsync(int id, UpdateApplicationDto dto, string userId);

    /// <summary>
    /// Updates the status of an application
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="status">New status</param>
    /// <param name="userId">User identifier</param>
    /// <returns>Updated application or null if not found</returns>
    Task<ApplicationResponseDto?> UpdateApplicationStatusAsync(int id, ApplicationStatus status, string userId);
    
    /// <summary>
    /// Deletes an application
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="userId">User identifier</param>
    /// <returns>True if deleted, false if not found</returns>
    Task<bool> DeleteApplicationAsync(int id, string userId);
}