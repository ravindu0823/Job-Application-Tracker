using JobApplicationTrackerApi.DTO.Applications;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Services.ApplicationsService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for managing job applications
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController(
    IApplicationService applicationService,
    IIdentityService identityService,
    ILogger<ApplicationsController> logger
) : ControllerBase
{
    private readonly IApplicationService _applicationService = applicationService ?? throw new ArgumentNullException(nameof(applicationService));
    private readonly IIdentityService _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
    private readonly ILogger<ApplicationsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Get paginated list of applications with optional filtering and sorting
    /// </summary>
    /// <param name="status">Filter by application status</param>
    /// <param name="priority">Filter by priority</param>
    /// <param name="searchTerm">Search in company name and position</param>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="startDate">Filter applications from this date</param>
    /// <param name="endDate">Filter applications until this date</param>
    /// <param name="sortBy">Sort by field (date, company, position, status, priority)</param>
    /// <param name="sortOrder">Sort order (asc, desc)</param>
    /// <returns>Paginated list of applications</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResultDto<ApplicationResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetApplications(
        [FromQuery] ApplicationStatus? status = null,
        [FromQuery] ApplicationPriority? priority = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? sortBy = "date",
        [FromQuery] string? sortOrder = "desc")
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            // Validate pagination parameters
            if (pageNumber < 1)
            {
                return BadRequest(ApiResponse<object>.Failure("Page number must be greater than 0"));
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest(ApiResponse<object>.Failure("Page size must be between 1 and 100"));
            }

            // Validate date range
            if (startDate.HasValue && endDate.HasValue && startDate > endDate)
            {
                return BadRequest(ApiResponse<object>.Failure("Start date cannot be after end date"));
            }

            var result = await _applicationService.GetApplicationsAsync(
                userId,
                status,
                priority,
                searchTerm,
                pageNumber,
                pageSize,
                startDate,
                endDate,
                sortBy,
                sortOrder);

            return Ok(ApiResponse<PaginatedResultDto<ApplicationResponseDto>>.Success(result, "Applications retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications");
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving applications"));
        }
    }

    /// <summary>
    /// Get a specific application by ID
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <returns>Application details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetApplicationById(int id)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var application = await _applicationService.GetApplicationByIdAsync(id, userId);

            if (application == null)
            {
                return NotFound(ApiResponse<object>.Failure($"Application with ID {id} not found"));
            }

            return Ok(ApiResponse<ApplicationResponseDto>.Success(application, "Application retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application {ApplicationId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving the application"));
        }
    }

    /// <summary>
    /// Create a new job application
    /// </summary>
    /// <param name="createApplicationDto">Application creation data</param>
    /// <returns>The created application</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ApplicationResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateApplication([FromBody] CreateApplicationDto createApplicationDto)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var application = await _applicationService.CreateApplicationAsync(createApplicationDto, userId);
            return CreatedAtAction(nameof(GetApplicationById), new { id = application.Id },
                ApiResponse<ApplicationResponseDto>.Success(application, "Application created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while creating application");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid application data");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating application");
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while creating the application"));
        }
    }

    /// <summary>
    /// Update an existing application
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="updateApplicationDto">Application update data</param>
    /// <returns>The updated application</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateApplication(int id, [FromBody] UpdateApplicationDto updateApplicationDto)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var application = await _applicationService.UpdateApplicationAsync(id, updateApplicationDto, userId);

            if (application == null)
            {
                return NotFound(ApiResponse<object>.Failure($"Application with ID {id} not found"));
            }

            return Ok(ApiResponse<ApplicationResponseDto>.Success(application, "Application updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation while updating application {ApplicationId}", id);
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid application data");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating application {ApplicationId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while updating the application"));
        }
    }

    /// <summary>
    /// Update application status
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="status">New status</param>
    /// <returns>The updated application</returns>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] ApplicationStatus status)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var application = await _applicationService.UpdateApplicationStatusAsync(id, status, userId);

            if (application == null)
            {
                return NotFound(ApiResponse<object>.Failure($"Application with ID {id} not found"));
            }

            return Ok(ApiResponse<ApplicationResponseDto>.Success(application, "Application status updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid status transition for application {ApplicationId}", id);
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for application {ApplicationId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while updating the application status"));
        }
    }

    /// <summary>
    /// Delete an application
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var deleted = await _applicationService.DeleteApplicationAsync(id, userId);

            if (!deleted)
            {
                return NotFound(ApiResponse<object>.Failure($"Application with ID {id} not found"));
            }

            return Ok(ApiResponse<object>.Success(new object(), "Application deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting application {ApplicationId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while deleting the application"));
        }
    }
}