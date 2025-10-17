using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.DTO.Applications;

/// <summary>
/// DTO for updating an existing application
/// </summary>
public class UpdateApplicationDto
{
    /// <summary>
    /// Name of the company
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// Position title
    /// </summary>
    public string? Position { get; set; }

    /// <summary>
    /// Job location (City, State/Country)
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// URL to the job posting
    /// </summary>
    public string? JobUrl { get; set; }

    /// <summary>
    /// Priority level of the application
    /// </summary>
    public ApplicationPriority? Priority { get; set; }

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
    public DateTime? ApplicationDate { get; set; }

    /// <summary>
    /// Date when the company responded
    /// </summary>
    public DateTime? ResponseDate { get; set; }

    /// <summary>
    /// Date when the offer was received
    /// </summary>
    public DateTime? OfferDate { get; set; }

    /// <summary>
    /// Job description text
    /// </summary>
    public string? JobDescription { get; set; }

    /// <summary>
    /// Job requirements text
    /// </summary>
    public string? Requirements { get; set; }
}