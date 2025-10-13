using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents salary statistics and insights
/// </summary>
public class SalaryInsightsDto
{
    /// <summary>
    /// Average salary across all applications with salary data
    /// </summary>
    public decimal? AverageSalary { get; set; }

    /// <summary>
    /// Median salary across all applications with salary data
    /// </summary>
    public decimal? MedianSalary { get; set; }

    /// <summary>
    /// Minimum salary from all applications
    /// </summary>
    public decimal? MinSalary { get; set; }

    /// <summary>
    /// Maximum salary from all applications
    /// </summary>
    public decimal? MaxSalary { get; set; }

    /// <summary>
    /// Average salary for applications that resulted in offers
    /// </summary>
    public decimal? AverageOfferSalary { get; set; }

    /// <summary>
    /// Number of applications with salary information
    /// </summary>
    public int ApplicationsWithSalaryCount { get; set; }

    /// <summary>
    /// Salary breakdown by status
    /// </summary>
    public List<SalaryByStatusDto> SalaryByStatus { get; set; } = new();

    /// <summary>
    /// Salary ranges distribution
    /// </summary>
    public List<SalaryRangeDistributionDto> SalaryRangeDistribution { get; set; } = new();
}

/// <summary>
/// Represents salary statistics for a specific status
/// </summary>
public class SalaryByStatusDto
{
    /// <summary>
    /// Application status
    /// </summary>
    public ApplicationStatus Status { get; set; }

    /// <summary>
    /// Status name as string
    /// </summary>
    public string StatusName { get; set; } = string.Empty;

    /// <summary>
    /// Average salary for this status
    /// </summary>
    public decimal? AverageSalary { get; set; }

    /// <summary>
    /// Number of applications with this status that have salary data
    /// </summary>
    public int Count { get; set; }
}

/// <summary>
/// Represents distribution of applications across salary ranges
/// </summary>
public class SalaryRangeDistributionDto
{
    /// <summary>
    /// Salary range label (e.g., "$50k-$75k")
    /// </summary>
    public string RangeLabel { get; set; } = string.Empty;

    /// <summary>
    /// Minimum value of the range
    /// </summary>
    public decimal MinRange { get; set; }

    /// <summary>
    /// Maximum value of the range
    /// </summary>
    public decimal MaxRange { get; set; }

    /// <summary>
    /// Number of applications in this salary range
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// Percentage of total applications with salary
    /// </summary>
    public double Percentage { get; set; }
}

