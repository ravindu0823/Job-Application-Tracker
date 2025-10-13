namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents top companies by application frequency
/// </summary>
public class TopCompanyDto
{
    /// <summary>
    /// Company name
    /// </summary>
    public string CompanyName { get; set; } = string.Empty;

    /// <summary>
    /// Number of applications to this company
    /// </summary>
    public int ApplicationCount { get; set; }

    /// <summary>
    /// Number of interviews with this company
    /// </summary>
    public int InterviewCount { get; set; }

    /// <summary>
    /// Number of offers from this company
    /// </summary>
    public int OfferCount { get; set; }

    /// <summary>
    /// Number of rejections from this company
    /// </summary>
    public int RejectionCount { get; set; }

    /// <summary>
    /// Success rate with this company (offers / applications * 100)
    /// </summary>
    public double SuccessRate { get; set; }

    /// <summary>
    /// Average salary for applications to this company
    /// </summary>
    public decimal? AverageSalary { get; set; }
}

