using JobApplicationTrackerApi.DTO.Interviews;

namespace JobApplicationTrackerApi.Services.InterviewsService;

/// <summary>
/// Service interface for managing interview operations
/// </summary>
public interface IInterviewService
{
    /// <summary>
    /// Get calendar view of all interviews within a date range
    /// </summary>
    /// <param name="startDate">Start date for calendar range</param>
    /// <param name="endDate">End date for calendar range</param>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>List of interviews for calendar display</returns>
    Task<IEnumerable<InterviewResponseDto>> GetCalendarViewAsync(DateTime startDate, DateTime endDate, string userId);

    /// <summary>
    /// Get all interviews for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>List of interviews for the application</returns>
    Task<IEnumerable<InterviewResponseDto>> GetInterviewsByApplicationAsync(int applicationId, string userId);

    /// <summary>
    /// Create a new interview for an application
    /// </summary>
    /// <param name="createInterviewDto">Interview creation details</param>
    /// /// <param name="applicationId">Application id for foreign key</param>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>Created interview DTO</returns>
    Task<InterviewResponseDto> CreateInterviewAsync(int applicationId, CreateInterviewDto createInterviewDto, string userId);

    /// <summary>
    /// Update an existing interview
    /// </summary>
    /// <param name="id">Interview ID</param>
    /// <param name="updateInterviewDto">Interview update details</param>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>Updated interview DTO</returns>
    Task<InterviewResponseDto> UpdateInterviewAsync(int id, UpdateInterviewDto updateInterviewDto, string userId);

    /// <summary>
    /// Delete an interview
    /// </summary>
    /// <param name="id">Interview ID</param>
    /// <param name="userId">User ID for authentication</param>
    Task DeleteInterviewAsync(int id, string userId);

    /// <summary>
    /// Get a single interview by ID
    /// </summary>
    /// <param name="id">Interview ID</param>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>Interview DTO</returns>
    Task<InterviewResponseDto> GetInterviewByIdAsync(int id, string userId);

    /// <summary>
    /// Mark reminder as sent for an interview
    /// </summary>
    /// <param name="id">Interview ID</param>
    /// <param name="userId">User ID for authentication</param>
    Task<bool> MarkReminderSentAsync(int id, string userId);

    /// <summary>
    /// Get upcoming interviews (next 7 days)
    /// </summary>
    /// <param name="userId">User ID for authentication</param>
    /// <returns>List of upcoming interviews</returns>
    Task<IEnumerable<InterviewResponseDto>> GetUpcomingInterviewsAsync(string userId);
}