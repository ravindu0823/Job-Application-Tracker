using JobApplicationTrackerApi.DTO.Interviews;
using JobApplicationTrackerApi.Services.InterviewsService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for managing interviews
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InterviewsController(
    IInterviewService interviewService,
    IIdentityService identityService,
    ILogger<InterviewsController> logger
) : ControllerBase
{
    private readonly IInterviewService _interviewService = interviewService ?? throw new ArgumentNullException(nameof(interviewService));
    private readonly IIdentityService _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
    private readonly ILogger<InterviewsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Get calendar view of interviews within a date range
    /// </summary>
    /// <param name="startDate">Start date for calendar range (yyyyMMdd format)</param>
    /// <param name="endDate">End date for calendar range (yyyyMMdd format)</param>
    /// <returns>List of interviews for calendar display</returns>
    [HttpGet("calendar")]
    [ProducesResponseType(typeof(ApiResponse<List<InterviewResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCalendarView([FromQuery] string startDate, [FromQuery] string endDate)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            if (!DateTime.TryParseExact(startDate, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var start) ||
                !DateTime.TryParseExact(endDate, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var end))
            {
                return BadRequest(ApiResponse<object>.Failure("Invalid date format. Use yyyyMMdd"));
            }

            if (start > end)
            {
                return BadRequest(ApiResponse<object>.Failure("Start date cannot be after end date"));
            }

            var interviews = await _interviewService.GetCalendarViewAsync(start, end, userId);
            return Ok(ApiResponse<List<InterviewResponseDto>>.Success(interviews.ToList(), "Calendar view retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving calendar view");
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving calendar view"));
        }
    }

    /// <summary>
    /// Get all interviews for a specific application
    /// </summary>
    /// <param name="appId">The application ID</param>
    /// <returns>List of interviews for the application</returns>
    [HttpGet("applications/{appId:int}/interviews")]
    [ProducesResponseType(typeof(ApiResponse<List<InterviewResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetInterviewsByApplication(int appId)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var interviews = await _interviewService.GetInterviewsByApplicationAsync(appId, userId);
            return Ok(ApiResponse<List<InterviewResponseDto>>.Success(interviews.ToList(), "Interviews retrieved successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Application not found or access denied for application {ApplicationId}", appId);
            return NotFound(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving interviews for application {ApplicationId}", appId);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving interviews"));
        }
    }

    /// <summary>
    /// Create a new interview for an application
    /// </summary>
    /// <param name="appId">The application ID</param>
    /// <param name="createInterviewDto">The interview data</param>
    /// <returns>The created interview</returns>
    [HttpPost("applications/{appId:int}/interviews")]
    [ProducesResponseType(typeof(ApiResponse<InterviewResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateInterview(int appId, [FromBody] CreateInterviewDto createInterviewDto)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var interview = await _interviewService.CreateInterviewAsync(appId, createInterviewDto, userId);
            return CreatedAtAction(nameof(GetInterview), new { id = interview.Id },
                ApiResponse<InterviewResponseDto>.Success(interview, "Interview created successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Application not found or access denied for application {ApplicationId}", appId);
            return NotFound(ApiResponse<object>.Failure(ex.Message));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid interview data");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating interview for application {ApplicationId}", appId);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while creating the interview"));
        }
    }

    /// <summary>
    /// Get a specific interview by ID
    /// </summary>
    /// <param name="id">The interview ID</param>
    /// <returns>The interview details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<InterviewResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetInterview(int id)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }
    
            var interview = await _interviewService.GetInterviewByIdAsync(id, userId);
            return Ok(ApiResponse<InterviewResponseDto>.Success(interview, "Interview retrieved successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Interview not found or access denied for interview {InterviewId}", id);
            return NotFound(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving interview {InterviewId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while retrieving the interview"));
        }
    }

    /// <summary>
    /// Update an existing interview
    /// </summary>
    /// <param name="id">The interview ID</param>
    /// <param name="updateInterviewDto">The updated interview data</param>
    /// <returns>The updated interview</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<InterviewResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewDto updateInterviewDto)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            var interview = await _interviewService.UpdateInterviewAsync(id, updateInterviewDto, userId);
            return Ok(ApiResponse<InterviewResponseDto>.Success(interview, "Interview updated successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Interview not found or access denied for interview {InterviewId}", id);
            return NotFound(ApiResponse<object>.Failure(ex.Message));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid interview data");
            return BadRequest(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating interview {InterviewId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while updating the interview"));
        }
    }

    /// <summary>
    /// Delete an interview
    /// </summary>
    /// <param name="id">The interview ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteInterview(int id)
    {
        try
        {
            var userId = _identityService.GetUserIdentity();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Failure("User not authenticated"));
            }

            await _interviewService.DeleteInterviewAsync(id, userId);
            return Ok(ApiResponse<object>.Success(new object(), "Interview deleted successfully"));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Interview not found or access denied for interview {InterviewId}", id);
            return NotFound(ApiResponse<object>.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting interview {InterviewId}", id);
            return StatusCode(500, ApiResponse<object>.Failure("An error occurred while deleting the interview"));
        }
    }
}