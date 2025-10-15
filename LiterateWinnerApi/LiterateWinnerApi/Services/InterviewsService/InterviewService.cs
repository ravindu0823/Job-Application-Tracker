using JobApplicationTrackerApi.DTO.Interviews;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using Microsoft.EntityFrameworkCore;

namespace JobApplicationTrackerApi.Services.InterviewsService;

/// <summary>
/// Service implementation for managing interview operations
/// </summary>
public class InterviewService(
    DefaultContext context,
    ICacheService cacheService,
    ILogger<InterviewService> logger
) : IInterviewService
{
    private readonly DefaultContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<InterviewService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <inheritdoc/>
    public async Task<IEnumerable<InterviewResponseDto>> GetCalendarViewAsync(DateTime startDate, DateTime endDate, string userId)
    {
        try
        {
            var cacheKey = $"interviews_calendar_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}_{userId}";

            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var interviews = await _context.Interviews
                    .Include(i => i.Application)
                    .Where(i => i.Application.UserId == userId &&
                               i.Application.Status == CommonStatus.Active &&
                               i.InterviewDate >= startDate &&
                               i.InterviewDate <= endDate)
                    .OrderBy(i => i.InterviewDate)
                    .Select(i => new InterviewResponseDto
                    {
                        Id = i.Id,
                        ApplicationId = i.ApplicationId,
                        InterviewDate = i.InterviewDate,
                        InterviewType = i.InterviewType,
                        Duration = i.Duration,
                        InterviewerName = i.InterviewerName,
                        InterviewerPosition = i.InterviewerPosition,
                        Location = i.Location,
                        MeetingLink = i.MeetingLink,
                        Notes = i.Notes,
                        Outcome = i.Outcome,
                        ReminderSent = i.ReminderSent,
                        CreatedUtc = i.CreatedUtc,
                        CreatedBy = i.CreatedBy,
                        UpdatedUtc = i.UpdatedUtc,
                        UpdatedBy = i.UpdatedBy
                    })
                    .ToListAsync();

                return interviews;
            }, TimeSpan.FromMinutes(10)) ?? new List<InterviewResponseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching calendar view for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<InterviewResponseDto>> GetInterviewsByApplicationAsync(int applicationId, string userId)
    {
        try
        {
            var cacheKey = $"interviews_application_{applicationId}_{userId}";

            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                // Verify the application belongs to the user
                var applicationExists = await _context.Applications
                    .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

                if (!applicationExists)
                {
                    throw new InvalidOperationException("Application not found or access denied");
                }

                var interviews = await _context.Interviews
                    .Where(i => i.ApplicationId == applicationId)
                    .OrderBy(i => i.InterviewDate)
                    .Select(i => new InterviewResponseDto
                    {
                        Id = i.Id,
                        ApplicationId = i.ApplicationId,
                        InterviewDate = i.InterviewDate,
                        InterviewType = i.InterviewType,
                        Duration = i.Duration,
                        InterviewerName = i.InterviewerName,
                        InterviewerPosition = i.InterviewerPosition,
                        Location = i.Location,
                        MeetingLink = i.MeetingLink,
                        Notes = i.Notes,
                        Outcome = i.Outcome,
                        ReminderSent = i.ReminderSent,
                        CreatedUtc = i.CreatedUtc,
                        CreatedBy = i.CreatedBy,
                        UpdatedUtc = i.UpdatedUtc,
                        UpdatedBy = i.UpdatedBy
                    })
                    .ToListAsync();

                return interviews;
            }, TimeSpan.FromMinutes(5)) ?? new List<InterviewResponseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching interviews for application {ApplicationId} and user {UserId}", applicationId, userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<InterviewResponseDto> CreateInterviewAsync(int applicationId,CreateInterviewDto createInterviewDto, string userId)
    {
        try
        {
            _logger.LogInformation("Creating interview for application ID: {ApplicationId}", applicationId);

            // Verify the application belongs to the user
            var application = await _context.Applications
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

            if (application == null)
            {
                throw new InvalidOperationException("Application not found or access denied");
            }

            if (createInterviewDto.InterviewDate <= DateTime.UtcNow)
            {
                throw new ArgumentException("Interview date must be in the future");
            }

            var interview = new Interview
            {
                ApplicationId = applicationId,
                InterviewDate = createInterviewDto.InterviewDate,
                InterviewType = createInterviewDto.InterviewType,
                Duration = createInterviewDto.Duration,
                InterviewerName = createInterviewDto.InterviewerName,
                InterviewerPosition = createInterviewDto.InterviewerPosition,
                Location = createInterviewDto.Location,
                MeetingLink = createInterviewDto.MeetingLink,
                Notes = createInterviewDto.Notes,
                ReminderSent = false
            };

            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"interviews_application_{applicationId}_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_calendar_*_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_upcoming_{userId}");

            _logger.LogInformation("Interview created successfully with ID: {InterviewId}", interview.Id);

            var responseDto = new InterviewResponseDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId,
                InterviewDate = interview.InterviewDate,
                InterviewType = interview.InterviewType,
                Duration = interview.Duration,
                InterviewerName = interview.InterviewerName,
                InterviewerPosition = interview.InterviewerPosition,
                Location = interview.Location,
                MeetingLink = interview.MeetingLink,
                Notes = interview.Notes,
                Outcome = interview.Outcome,
                ReminderSent = interview.ReminderSent,
                CreatedUtc = interview.CreatedUtc,
                CreatedBy = interview.CreatedBy,
                UpdatedUtc = interview.UpdatedUtc,
                UpdatedBy = interview.UpdatedBy
            };

            return responseDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating interview for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<InterviewResponseDto> UpdateInterviewAsync(int id, UpdateInterviewDto updateInterviewDto, string userId)
    {
        try
        {
            _logger.LogInformation("Updating interview ID: {InterviewId}", id);

            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == userId);

            if (interview == null)
            {
                throw new InvalidOperationException("Interview not found or access denied");
            }

            if (updateInterviewDto.InterviewDate.HasValue && updateInterviewDto.InterviewDate <= DateTime.UtcNow)
            {
                throw new ArgumentException("Interview date must be in the future");
            }

            // Update only provided fields
            if (updateInterviewDto.InterviewDate.HasValue)
                interview.InterviewDate = updateInterviewDto.InterviewDate.Value;

            if (updateInterviewDto.InterviewType.HasValue)
                interview.InterviewType = updateInterviewDto.InterviewType.Value;

            if (updateInterviewDto.Duration.HasValue)
                interview.Duration = updateInterviewDto.Duration.Value;

            if (!string.IsNullOrEmpty(updateInterviewDto.InterviewerName))
                interview.InterviewerName = updateInterviewDto.InterviewerName;

            if (!string.IsNullOrEmpty(updateInterviewDto.InterviewerPosition))
                interview.InterviewerPosition = updateInterviewDto.InterviewerPosition;

            if (!string.IsNullOrEmpty(updateInterviewDto.Location))
                interview.Location = updateInterviewDto.Location;

            if (!string.IsNullOrEmpty(updateInterviewDto.MeetingLink))
                interview.MeetingLink = updateInterviewDto.MeetingLink;

            if (!string.IsNullOrEmpty(updateInterviewDto.Notes))
                interview.Notes = updateInterviewDto.Notes;

            if (!string.IsNullOrEmpty(updateInterviewDto.Outcome))
                interview.Outcome = updateInterviewDto.Outcome;

            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"interviews_application_{interview.ApplicationId}_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_calendar_*_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_upcoming_{userId}");
            await _cacheService.RemoveAsync($"interview_{id}_{userId}");

            _logger.LogInformation("Interview updated successfully with ID: {InterviewId}", id);

            var responseDto = new InterviewResponseDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId,
                InterviewDate = interview.InterviewDate,
                InterviewType = interview.InterviewType,
                Duration = interview.Duration,
                InterviewerName = interview.InterviewerName,
                InterviewerPosition = interview.InterviewerPosition,
                Location = interview.Location,
                MeetingLink = interview.MeetingLink,
                Notes = interview.Notes,
                Outcome = interview.Outcome,
                ReminderSent = interview.ReminderSent,
                CreatedUtc = interview.CreatedUtc,
                CreatedBy = interview.CreatedBy,
                UpdatedUtc = interview.UpdatedUtc,
                UpdatedBy = interview.UpdatedBy
            };

            return responseDto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating interview {InterviewId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task DeleteInterviewAsync(int id, string userId)
    {
        try
        {
            _logger.LogInformation("Deleting interview ID: {InterviewId}", id);

            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == userId);

            if (interview == null)
            {
                throw new InvalidOperationException("Interview not found or access denied");
            }

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"interviews_application_{interview.ApplicationId}_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_calendar_*_{userId}");
            await _cacheService.RemoveByPatternAsync($"interviews_upcoming_{userId}");
            await _cacheService.RemoveAsync($"interview_{id}_{userId}");

            _logger.LogInformation("Interview deleted successfully with ID: {InterviewId}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting interview {InterviewId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<InterviewResponseDto> GetInterviewByIdAsync(int id, string userId)
    {
        try
        {
            var cacheKey = $"interview_{id}_{userId}";

            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var interview = await _context.Interviews
                    .Include(i => i.Application)
                    .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == userId);

                if (interview == null)
                {
                    throw new InvalidOperationException("Interview not found or access denied");
                }

                var responseDto = new InterviewResponseDto
                {
                    Id = interview.Id,
                    ApplicationId = interview.ApplicationId,
                    InterviewDate = interview.InterviewDate,
                    InterviewType = interview.InterviewType,
                    Duration = interview.Duration,
                    InterviewerName = interview.InterviewerName,
                    InterviewerPosition = interview.InterviewerPosition,
                    Location = interview.Location,
                    MeetingLink = interview.MeetingLink,
                    Notes = interview.Notes,
                    Outcome = interview.Outcome,
                    ReminderSent = interview.ReminderSent,
                    CreatedUtc = interview.CreatedUtc,
                    CreatedBy = interview.CreatedBy,
                    UpdatedUtc = interview.UpdatedUtc,
                    UpdatedBy = interview.UpdatedBy
                };

                return responseDto;
            }, TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching interview {InterviewId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<bool> MarkReminderSentAsync(int id, string userId)
    {
        try
        {
            _logger.LogInformation("Marking reminder as sent for interview ID: {InterviewId}", id);

            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == userId);

            if (interview == null)
            {
                throw new InvalidOperationException("Interview not found or access denied");
            }

            interview.ReminderSent = true;
            await _context.SaveChangesAsync();

            // Clear cache entry
            await _cacheService.RemoveAsync($"interview_{id}_{userId}");

            _logger.LogInformation("Reminder marked as sent for interview ID: {InterviewId}", id);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking reminder as sent for interview {InterviewId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<InterviewResponseDto>> GetUpcomingInterviewsAsync(string userId)
    {
        try
        {
            var cacheKey = $"interviews_upcoming_{userId}";

            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var now = DateTime.UtcNow;
                var nextWeek = now.AddDays(7);

                var interviews = await _context.Interviews
                    .Include(i => i.Application)
                    .Where(i => i.Application.UserId == userId &&
                               i.Application.Status == CommonStatus.Active &&
                               i.InterviewDate >= now &&
                               i.InterviewDate <= nextWeek)
                    .OrderBy(i => i.InterviewDate)
                    .Select(i => new InterviewResponseDto
                    {
                        Id = i.Id,
                        ApplicationId = i.ApplicationId,
                        InterviewDate = i.InterviewDate,
                        InterviewType = i.InterviewType,
                        Duration = i.Duration,
                        InterviewerName = i.InterviewerName,
                        InterviewerPosition = i.InterviewerPosition,
                        Location = i.Location,
                        MeetingLink = i.MeetingLink,
                        Notes = i.Notes,
                        Outcome = i.Outcome,
                        ReminderSent = i.ReminderSent,
                        CreatedUtc = i.CreatedUtc,
                        CreatedBy = i.CreatedBy,
                        UpdatedUtc = i.UpdatedUtc,
                        UpdatedBy = i.UpdatedBy
                    })
                    .ToListAsync();

                return interviews;
            }, TimeSpan.FromMinutes(5)) ?? new List<InterviewResponseDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching upcoming interviews for user {UserId}", userId);
            throw;
        }
    }
}