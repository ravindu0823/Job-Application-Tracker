namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents response rate calculations and metrics
/// </summary>
public class ResponseRateDto
{
    /// <summary>
    /// Total number of applications
    /// </summary>
    public int TotalApplications { get; set; }

    /// <summary>
    /// Number of applications that received a response
    /// </summary>
    public int ApplicationsWithResponse { get; set; }

    /// <summary>
    /// Number of applications without response
    /// </summary>
    public int ApplicationsWithoutResponse { get; set; }

    /// <summary>
    /// Response rate percentage (applications with response / total * 100)
    /// </summary>
    public double ResponseRatePercentage { get; set; }

    /// <summary>
    /// Number of applications that led to interviews
    /// </summary>
    public int ApplicationsWithInterview { get; set; }

    /// <summary>
    /// Interview rate percentage (applications with interview / total * 100)
    /// </summary>
    public double InterviewRatePercentage { get; set; }

    /// <summary>
    /// Number of applications that led to offers
    /// </summary>
    public int ApplicationsWithOffer { get; set; }

    /// <summary>
    /// Offer rate percentage (applications with offer / total * 100)
    /// </summary>
    public double OfferRatePercentage { get; set; }

    /// <summary>
    /// Average days to receive a response
    /// </summary>
    public double? AverageDaysToResponse { get; set; }

    /// <summary>
    /// Median days to receive a response
    /// </summary>
    public double? MedianDaysToResponse { get; set; }

    /// <summary>
    /// Fastest response time in days
    /// </summary>
    public int? FastestResponseDays { get; set; }

    /// <summary>
    /// Slowest response time in days
    /// </summary>
    public int? SlowestResponseDays { get; set; }
}

