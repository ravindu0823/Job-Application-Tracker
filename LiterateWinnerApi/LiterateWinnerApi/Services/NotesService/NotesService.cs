using AutoMapper;
using AutoMapper.QueryableExtensions;
using JobApplicationTrackerApi.DTO.Notes;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Infrastructure.Exceptions;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using Microsoft.EntityFrameworkCore;

namespace JobApplicationTrackerApi.Services.NotesService;

/// <summary>
/// Service for managing application notes
/// </summary>
public class NotesService(
    DefaultContext context,
    ICacheService cacheService,
    ILogger<NotesService> logger,
    IMapper mapper
) : INotesService
{
    private readonly DefaultContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<NotesService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IMapper _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));

    /// <inheritdoc />
    public async Task<List<NoteResponseDto>> GetNotesByApplicationAsync(int applicationId, string userId)
    {
        var cacheKey = $"notes_application_{applicationId}_{userId}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            // Verify the application belongs to the user
            var applicationExists = await _context.Applications
                .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

            if (!applicationExists)
            {
                throw new NotFoundException("Application not found or access denied");
            }

            return await _context.Notes
                .Where(n => n.ApplicationId == applicationId && n.Status == CommonStatus.Active)
                .OrderByDescending(n => n.CreatedUtc)
                .ProjectTo<NoteResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }, TimeSpan.FromMinutes(5)) ?? new List<NoteResponseDto>();
    }

    /// <inheritdoc />
    public async Task<NoteResponseDto> GetNoteByIdAsync(int id, string userId)
    {
        var cacheKey = $"note_{id}_{userId}";

        var note = await _cacheService.GetOrSetAsync(cacheKey, () =>
            _context.Notes
                .AsNoTracking()
                .Where(n => n.Id == id && n.Status == CommonStatus.Active && n.Application.UserId == userId)
                .ProjectTo<NoteResponseDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(),
            TimeSpan.FromMinutes(10));

        if (note == null)
        {
            throw new NotFoundException("Note not found or access denied");
        }

        return note;
    }

    /// <inheritdoc />
    public async Task<NoteResponseDto> CreateNoteAsync(CreateNoteDto createNoteDto, string userId)
    {
        var application = await _context.Applications
            .FirstOrDefaultAsync(a => a.Id == createNoteDto.ApplicationId && a.UserId == userId && a.Status == CommonStatus.Active);

        if (application == null)
        {
            throw new NotFoundException("Application not found or access denied");
        }

        var note = _mapper.Map<Note>(createNoteDto);
        note.CreatedBy = userId;
        note.Status = CommonStatus.Active;

        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        // Invalidate cache for the application's notes
        await _cacheService.RemoveByPatternAsync($"notes_application_{createNoteDto.ApplicationId}_{userId}");

        return _mapper.Map<NoteResponseDto>(note);
    }

    /// <inheritdoc />
    public async Task<NoteResponseDto> UpdateNoteAsync(int id, UpdateNoteDto updateNoteDto, string userId)
    {
        var note = await _context.Notes
            .Include(n => n.Application)
            .FirstOrDefaultAsync(n => n.Id == id && n.Status == CommonStatus.Active && n.Application.UserId == userId);

        if (note == null)
        {
            throw new NotFoundException("Note not found or access denied");
        }

        _mapper.Map(updateNoteDto, note);
        note.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        // Invalidate relevant caches
        await _cacheService.RemoveByPatternAsync($"notes_application_{note.ApplicationId}_{userId}");
        await _cacheService.RemoveAsync($"note_{id}_{userId}");

        return _mapper.Map<NoteResponseDto>(note);
    }

    /// <inheritdoc />
    public async Task DeleteNoteAsync(int id, string userId)
    {
        var note = await _context.Notes
            .Include(n => n.Application)
            .FirstOrDefaultAsync(n => n.Id == id && n.Status == CommonStatus.Active && n.Application.UserId == userId);

        if (note == null)
        {
            // To prevent leaking information, we don't throw an error if the note doesn't exist.
            // The outcome is the same for the user: the note is gone.
            _logger.LogWarning("Attempted to delete a note that was not found or access was denied. NoteId: {NoteId}, UserId: {UserId}", id, userId);
            return;
        }

        // Soft delete
        note.Status = CommonStatus.Delete;
        note.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        // Invalidate relevant caches
        await _cacheService.RemoveByPatternAsync($"notes_application_{note.ApplicationId}_{userId}");
        await _cacheService.RemoveAsync($"note_{id}_{userId}");
    }

    /// <inheritdoc />
    public async Task<List<NoteResponseDto>> GetNotesByTypeAsync(int applicationId, NoteType noteType, string userId)
    {
        var cacheKey = $"notes_application_{applicationId}_type_{noteType}_{userId}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var applicationExists = await _context.Applications
                .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

            if (!applicationExists)
            {
                throw new NotFoundException("Application not found or access denied");
            }

            return await _context.Notes
                .Where(n => n.ApplicationId == applicationId && n.NoteType == noteType && n.Status == CommonStatus.Active)
                .OrderByDescending(n => n.CreatedUtc)
                .ProjectTo<NoteResponseDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }, TimeSpan.FromMinutes(5)) ?? new List<NoteResponseDto>();
    }

    /// <inheritdoc />
    public async Task<List<NoteResponseDto>> SearchNotesAsync(int applicationId, string searchTerm, string userId)
    {
        // Search is not cached as search terms are highly variable.
        var applicationExists = await _context.Applications
            .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

        if (!applicationExists)
        {
            throw new NotFoundException("Application not found or access denied");
        }

        return await _context.Notes
            .Where(n => n.ApplicationId == applicationId &&
                       n.Status == CommonStatus.Active &&
                       (n.Title.Contains(searchTerm) || n.Content.Contains(searchTerm)))
            .OrderByDescending(n => n.CreatedUtc)
            .ProjectTo<NoteResponseDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }
}
