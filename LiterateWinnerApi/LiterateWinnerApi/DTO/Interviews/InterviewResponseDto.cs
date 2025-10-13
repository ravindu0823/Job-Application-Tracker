using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Interviews;

/// <summary>
/// DTO for returning interview details
/// </summary>
public class InterviewResponseDto
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Foreign key to Application
    /// </summary>
    public int ApplicationId { get; set; }

    /// <summary>
    /// Date and time of the interview
    /// </summary>
    public DateTime InterviewDate { get; set; }

    /// <summary>
    /// Type of interview
    /// </summary>
    public InterviewType InterviewType { get; set; }

    /// <summary>
    /// Duration of the interview in minutes
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Name of the interviewer
    /// </summary>
    public string? InterviewerName { get; set; }

    /// <summary>
    /// Position/title of the interviewer
    /// </summary>
    public string? InterviewerPosition { get; set; }

    /// <summary>
    /// Location of the interview (office address or "Virtual")
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Meeting link for virtual interviews (Zoom, Teams, etc.)
    /// </summary>
    public string? MeetingLink { get; set; }

    /// <summary>
    /// Interview notes
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Outcome of the interview
    /// </summary>
    public string? Outcome { get; set; }

    /// <summary>
    /// Whether email reminder has been sent
    /// </summary>
    public bool ReminderSent { get; set; }
    
    /// <summary>
    /// Date and time when the interview was created
    /// </summary>
    public DateTime CreatedUtc { get; init; }

    /// <summary>
    /// User who created the interview
    /// </summary>
    public string CreatedBy { get; init; } = string.Empty;

    /// <summary>
    /// Date and time when the interview was last updated
    /// </summary>
    public DateTime? UpdatedUtc { get; init; }

    /// <summary>
    /// User who last updated the interview
    /// </summary>
    public string? UpdatedBy { get; init; }
}