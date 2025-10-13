using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Interviews;

/// <summary>
/// DTO for interview summary (lightweight response)
/// </summary>
public class InterviewSummaryDto
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Date and time of the interview
    /// </summary>
    public DateTime InterviewDate { get; set; }

    /// <summary>
    /// Type of interview
    /// </summary>
    public InterviewType InterviewType { get; set; }

    /// <summary>
    /// Name of the interviewer
    /// </summary>
    public string? InterviewerName { get; set; }

    /// <summary>
    /// Outcome of the interview
    /// </summary>
    public string? Outcome { get; set; }
}