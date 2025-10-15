using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Applications;

/// <summary>
/// DTO for reading application data (minimal details)
/// </summary>
public class ApplicationResponseDto
{
    /// <summary>
    /// Primary key
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Name of the company
    /// </summary>
    public string CompanyName { get; set; } = string.Empty;

    /// <summary>
    /// Position title
    /// </summary>
    public string Position { get; set; } = string.Empty;

    /// <summary>
    /// Job location (City, State/Country)
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// URL to the job posting
    /// </summary>
    public string? JobUrl { get; set; }

    /// <summary>
    /// Current status of the application
    /// </summary>
    public ApplicationStatus ApplicationStatus { get; set; }

    /// <summary>
    /// Priority level of the application
    /// </summary>
    public ApplicationPriority Priority { get; set; }

    /// <summary>
    /// Expected or offered salary
    /// </summary>
    public decimal? Salary { get; set; }

    /// <summary>
    /// Minimum salary in range
    /// </summary>
    public decimal? SalaryMin { get; set; }

    /// <summary>
    /// Maximum salary in range
    /// </summary>
    public decimal? SalaryMax { get; set; }

    /// <summary>
    /// Date when the application was submitted
    /// </summary>
    public DateTime ApplicationDate { get; set; }

    /// <summary>
    /// Date when the company responded
    /// </summary>
    public DateTime? ResponseDate { get; set; }

    /// <summary>
    /// Date when the offer was received
    /// </summary>
    public DateTime? OfferDate { get; set; }

    /// <summary>
    /// Date and time when the application was created
    /// </summary>
    public DateTime CreatedUtc { get; init; }

    /// <summary>
    /// User who created the application
    /// </summary>
    public string CreatedBy { get; init; } = string.Empty;

    /// <summary>
    /// Date and time when the application was last updated
    /// </summary>
    public DateTime? UpdatedUtc { get; init; }

    /// <summary>
    /// User who last updated the application
    /// </summary>
    public string? UpdatedBy { get; init; }
    
    /// <summary>
    /// Total number of interviews associated with this application.
    /// </summary>
    public int? InterviewCount { get; set; }

    /// <summary>
    /// Total number of notes linked to this application.
    /// </summary>
    public int? NoteCount { get; set; }

    /// <summary>
    /// Total number of contacts related to this application.
    /// </summary>
    public int? ContactCount { get; set; }

    /// <summary>
    /// Total number of documents uploaded for this application.
    /// </summary>
    public int? DocumentCount { get; set; }

}