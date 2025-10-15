using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Interviews;

/// <summary>
/// DTO for create a new interview
/// </summary>
public class CreateInterviewDto
{
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
}