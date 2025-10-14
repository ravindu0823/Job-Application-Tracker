using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents application count distribution by status (for pie charts)
/// </summary>
public class StatusDistributionDto
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
    /// Number of applications with this status
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// Percentage of total applications
    /// </summary>
    public double Percentage { get; set; }
}

