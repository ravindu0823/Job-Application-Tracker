using JobApplicationTrackerApi.DTO.Statistics;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Services.StatisticsService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for handling application statistics and analytics
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController(
  IStatisticsService statisticsService,
  IIdentityService identityService,
  ILogger<StatisticsController> logger
) : ControllerBase
{
  private readonly IStatisticsService _statisticsService =
    statisticsService ?? throw new ArgumentNullException(nameof(statisticsService));

  private readonly IIdentityService _identityService =
    identityService ?? throw new ArgumentNullException(nameof(identityService));

  private readonly ILogger<StatisticsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

  /// <summary>
  /// Get overview statistics for the dashboard
  /// </summary>
  /// <returns>Overview statistics including total applications, status counts, and rates</returns>
  [HttpGet("overview")]
  [ProducesResponseType(typeof(ApiResponse<OverviewStatisticsDto>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetOverviewStatistics()
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      var statistics = await _statisticsService.GetOverviewStatisticsAsync(userId);
      return Ok(ApiResponse<OverviewStatisticsDto>.Success(statistics, "Overview statistics retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving overview statistics");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving overview statistics"));
    }
  }

  /// <summary>
  /// Get application distribution by status
  /// </summary>
  /// <returns>List of status distributions for pie charts</returns>
  [HttpGet("by-status")]
  [ProducesResponseType(typeof(ApiResponse<List<StatusDistributionDto>>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetStatusDistribution()
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      var distribution = await _statisticsService.GetStatusDistributionAsync(userId);
      return Ok(ApiResponse<List<StatusDistributionDto>>.Success(distribution,
        "Status distribution retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving status distribution");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving status distribution"));
    }
  }

  /// <summary>
  /// Get timeline data for applications over a date range
  /// </summary>
  /// <param name="startDate">Optional start date (defaults to 12 months ago)</param>
  /// <param name="endDate">Optional end date (defaults to today)</param>
  /// <returns>Timeline data with data points for line charts</returns>
  [HttpGet("timeline")]
  [ProducesResponseType(typeof(ApiResponse<TimelineDataDto>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetTimelineData([FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null)
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      var timeline = await _statisticsService.GetTimelineDataAsync(userId, startDate, endDate);
      return Ok(ApiResponse<TimelineDataDto>.Success(timeline, "Timeline data retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving timeline data");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving timeline data"));
    }
  }

  /// <summary>
  /// Get response rate metrics
  /// </summary>
  /// <returns>Response rate statistics including interview and offer rates</returns>
  [HttpGet("response-rate")]
  [ProducesResponseType(typeof(ApiResponse<ResponseRateDto>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetResponseRate()
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      var responseRate = await _statisticsService.GetResponseRateAsync(userId);
      return Ok(ApiResponse<ResponseRateDto>.Success(responseRate, "Response rate retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving response rate");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving response rate"));
    }
  }

  /// <summary>
  /// Get salary insights and statistics
  /// </summary>
  /// <returns>Salary statistics including average, median, min, max, and distribution</returns>
  [HttpGet("salary-insights")]
  [ProducesResponseType(typeof(ApiResponse<SalaryInsightsDto>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetSalaryInsights()
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      var salaryInsights = await _statisticsService.GetSalaryInsightsAsync(userId);
      return Ok(ApiResponse<SalaryInsightsDto>.Success(salaryInsights, "Salary insights retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving salary insights");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving salary insights"));
    }
  }

  /// <summary>
  /// Get top companies by application frequency
  /// </summary>
  /// <param name="topN">Number of top companies to return (default: 10)</param>
  /// <returns>List of top companies with application counts and statistics</returns>
  [HttpGet("top-companies")]
  [ProducesResponseType(typeof(ApiResponse<List<TopCompanyDto>>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
  public async Task<IActionResult> GetTopCompanies([FromQuery] int topN = 10)
  {
    try
    {
      var userId = _identityService.GetUserIdentity();
      if (string.IsNullOrEmpty(userId))
      {
        return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
      }

      if (topN < 1 || topN > 100)
      {
        return BadRequest(ApiResponse<object>.Failure("topN must be between 1 and 100"));
      }

      var topCompanies = await _statisticsService.GetTopCompaniesAsync(userId, topN);
      return Ok(ApiResponse<List<TopCompanyDto>>.Success(topCompanies, "Top companies retrieved successfully"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Error retrieving top companies");
      return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving top companies"));
    }
  }
}

