using JobApplicationTrackerApi.DTO.Statistics;

namespace JobApplicationTrackerApi.Services.StatisticsService;

/// <summary>
/// Service for handling application statistics and analytics
/// </summary>
public interface IStatisticsService
{
    /// <summary>
    /// Get overview statistics for the user's dashboard
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Overview statistics</returns>
    Task<OverviewStatisticsDto> GetOverviewStatisticsAsync(string userId);

    /// <summary>
    /// Get application distribution by status
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>List of status distributions</returns>
    Task<List<StatusDistributionDto>> GetStatusDistributionAsync(string userId);

    /// <summary>
    /// Get timeline data for applications over a date range
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="startDate">Optional start date (defaults to 12 months ago)</param>
    /// <param name="endDate">Optional end date (defaults to today)</param>
    /// <returns>Timeline data with data points</returns>
    Task<TimelineDataDto> GetTimelineDataAsync(string userId, DateTime? startDate = null, DateTime? endDate = null);

    /// <summary>
    /// Get response rate metrics
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Response rate statistics</returns>
    Task<ResponseRateDto> GetResponseRateAsync(string userId);

    /// <summary>
    /// Get salary insights and statistics
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Salary insights</returns>
    Task<SalaryInsightsDto> GetSalaryInsightsAsync(string userId);

    /// <summary>
    /// Get top companies by application frequency
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="topN">Number of top companies to return (default: 10)</param>
    /// <returns>List of top companies</returns>
    Task<List<TopCompanyDto>> GetTopCompaniesAsync(string userId, int topN = 10);
}

