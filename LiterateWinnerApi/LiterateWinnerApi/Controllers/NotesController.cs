using JobApplicationTrackerApi.DTO.Notes;
using JobApplicationTrackerApi.Services.NotesService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for managing application notes
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController(
    INotesService notesService,
    IIdentityService identityService,
    ILogger<NotesController> logger
) : ControllerBase
{
    private readonly INotesService _notesService = notesService ?? throw new ArgumentNullException(nameof(notesService));
    private readonly IIdentityService _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
    private readonly ILogger<NotesController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Get all notes for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <returns>List of notes for the application</returns>
    [HttpGet("application/{applicationId:int}")]
    [ProducesResponseType(typeof(ApiResponse<List<NoteResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetNotesByApplication(int applicationId)
    {
        var userId = GetUserId();
        var notes = await _notesService.GetNotesByApplicationAsync(applicationId, userId);
        return Ok(ApiResponse<List<NoteResponseDto>>.Success(notes, "Notes retrieved successfully"));
    }

    /// <summary>
    /// Get a specific note by ID
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <returns>The note details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<NoteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetNote(int id)
    {
        var userId = GetUserId();
        var note = await _notesService.GetNoteByIdAsync(id, userId);
        // The service layer is now expected to throw an exception if the note is not found.
        // The GlobalExceptionHandlerMiddleware will handle this and return a 404 Not Found.
        return Ok(ApiResponse<NoteResponseDto>.Success(note, "Note retrieved successfully"));
    }

    /// <summary>
    /// Create a new note
    /// </summary>
    /// <param name="createNoteDto">The note data</param>
    /// <returns>The created note</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<NoteResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateNote([FromBody] CreateNoteDto createNoteDto)
    {
        var userId = GetUserId();
        var note = await _notesService.CreateNoteAsync(createNoteDto, userId);
        return CreatedAtAction(nameof(GetNote), new { id = note.Id },
            ApiResponse<NoteResponseDto>.Success(note, "Note created successfully"));
    }

    /// <summary>
    /// Update an existing note
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <param name="updateNoteDto">The updated note data</param>
    /// <returns>The updated note</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<NoteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateNote(int id, [FromBody] UpdateNoteDto updateNoteDto)
    {
        var userId = GetUserId();
        var note = await _notesService.UpdateNoteAsync(id, updateNoteDto, userId);
        return Ok(ApiResponse<NoteResponseDto>.Success(note, "Note updated successfully"));
    }

    /// <summary>
    /// Delete a note
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var userId = GetUserId();
        //TODO !:cleanup after successful merge and testing
        // var result = await _notesService.DeleteNoteAsync(id, userId);
        // if (!result)
        // {
        //     // The service layer should throw InvalidOperationException for not found, which the middleware will handle.
        //     // This check remains as a safeguard if the service returns false for other reasons.
        //     return NotFound(ApiResponse<object>.Failure("Note not found or you do not have permission."));
        // }
        await _notesService.DeleteNoteAsync(id, userId);
        return Ok(ApiResponse<object>.Success(new object(), "Note deleted successfully"));
    }

    private string GetUserId()
    {
        var userId = _identityService.GetUserIdentity();
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("User ID not found in token claims.");
            throw new UnauthorizedAccessException("User not authenticated or token is invalid.");
        }
        return userId;
    }
}
