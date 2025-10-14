namespace JobApplicationTrackerApi.DTO.Statistics;

/// <summary>
/// Represents timeline data for line charts
/// </summary>
public class TimelineDataDto
{
    /// <summary>
    /// Start date of the timeline period
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date of the timeline period
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// List of data points for the timeline
    /// </summary>
    public List<TimelineDataPointDto> DataPoints { get; set; } = new();
}

/// <summary>
/// Represents a single data point in the timeline
/// </summary>
public class TimelineDataPointDto
{
    /// <summary>
    /// Date of the data point
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Number of applications submitted on this date
    /// </summary>
    public int ApplicationsSubmitted { get; set; }

    /// <summary>
    /// Number of interviews on this date
    /// </summary>
    public int InterviewsScheduled { get; set; }

    /// <summary>
    /// Number of offers received on this date
    /// </summary>
    public int OffersReceived { get; set; }

    /// <summary>
    /// Number of rejections on this date
    /// </summary>
    public int RejectionsReceived { get; set; }

    /// <summary>
    /// Cumulative total applications up to this date
    /// </summary>
    public int CumulativeApplications { get; set; }
}

