using JobApplicationTrackerApi.DTO.Notes;
using JobApplicationTrackerApi.Enum;

namespace JobApplicationTrackerApi.Services.NotesService;

/// <summary>
/// Service interface for managing application notes
/// </summary>
public interface INotesService
{
    /// <summary>
    /// Get all notes for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>List of notes for the application</returns>
    Task<List<NoteResponseDto>> GetNotesByApplicationAsync(int applicationId, string userId);

    /// <summary>
    /// Get a specific note by ID
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The note details. Throws an exception if not found.</returns>
    Task<NoteResponseDto> GetNoteByIdAsync(int id, string userId);

    /// <summary>
    /// Create a new note
    /// </summary>
    /// <param name="createNoteDto">The note data</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The created note</returns>
    Task<NoteResponseDto> CreateNoteAsync(CreateNoteDto createNoteDto, string userId);

    /// <summary>
    /// Update an existing note
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <param name="updateNoteDto">The updated note data</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The updated note</returns>
    Task<NoteResponseDto> UpdateNoteAsync(int id, UpdateNoteDto updateNoteDto, string userId);

    /// <summary>
    /// Delete a note
    /// </summary>
    /// <param name="id">The note ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>A task that completes when the note is deleted. Throws an exception if not found.</returns>
    Task DeleteNoteAsync(int id, string userId);

    /// <summary>
    /// Get notes by type for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="noteType">The note type</param>
    /// <param name="userId">The user ID</param>
    /// <returns>List of notes of the specified type</returns>
    Task<List<NoteResponseDto>> GetNotesByTypeAsync(int applicationId, NoteType noteType, string userId);

    /// <summary>
    /// Search notes by content
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="searchTerm">The search term</param>
    /// <param name="userId">The user ID</param>
    /// <returns>List of matching notes</returns>
    Task<List<NoteResponseDto>> SearchNotesAsync(int applicationId, string searchTerm, string userId);
}
