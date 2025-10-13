namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents overall statistics for the dashboard
/// </summary>
public class OverviewStatisticsDto
{
  /// <summary>
  /// Total number of applications
  /// </summary>
  public int TotalApplications { get; set; }

  /// <summary>
  /// Number of applications with status Applied
  /// </summary>
  public int AppliedCount { get; set; }

  /// <summary>
  /// Number of applications with status Interview
  /// </summary>
  public int InterviewCount { get; set; }

  /// <summary>
  /// Number of applications with status Offer
  /// </summary>
  public int OfferCount { get; set; }

  /// <summary>
  /// Number of applications with status Rejected
  /// </summary>
  public int RejectedCount { get; set; }

  /// <summary>
  /// Response rate percentage (applications with response date / total applications * 100)
  /// </summary>
  public double ResponseRate { get; set; }

  /// <summary>
  /// Success rate percentage (offers / total applications * 100)
  /// </summary>
  public double SuccessRate { get; set; }

  /// <summary>
  /// Interview rate percentage (interviews / total applications * 100)
  /// </summary>
  public double InterviewRate { get; set; }

  /// <summary>
  /// Average days between application and response
  /// </summary>
  public double? AverageDaysToResponse { get; set; }

  /// <summary>
  /// Average days between application and first interview
  /// </summary>
  public double? AverageDaysToInterview { get; set; }

  /// <summary>
  /// Average days between application and offer
  /// </summary>
  public double? AverageDaysToOffer { get; set; }

  /// <summary>
  /// Number of applications submitted this week
  /// </summary>
  public int ApplicationsThisWeek { get; set; }

  /// <summary>
  /// Number of applications submitted this month
  /// </summary>
  public int ApplicationsThisMonth { get; set; }

  /// <summary>
  /// Number of upcoming interviews
  /// </summary>
  public int UpcomingInterviews { get; set; }
}

