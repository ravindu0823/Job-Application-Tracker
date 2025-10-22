using JobApplicationTrackerApi.DTO.Applications;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using Microsoft.EntityFrameworkCore;

namespace JobApplicationTrackerApi.Services.ApplicationsService;

/// <summary>
/// Service implementation for managing job applications
/// </summary>
public class ApplicationService(
    DefaultContext context,
    ICacheService cacheService,
    ILogger<ApplicationService> logger
    ) : IApplicationService
{
    private readonly DefaultContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<ApplicationService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <inheritdoc />
    public async Task<PaginatedResultDto<ApplicationResponseDto>> GetApplicationsAsync(
    string userId,
    ApplicationStatus? status = null,
    ApplicationPriority? priority = null,
    string? searchTerm = null,
    int pageNumber = 1,
    int pageSize = 10,
    DateTime? startDate = null,
    DateTime? endDate = null,
    string? sortBy = "date",
    string? sortOrder = "desc")
{
    try
    {
        // Normalize cache key
        var normalizedSearch = string.IsNullOrWhiteSpace(searchTerm) ? "none" : searchTerm.ToLower();
        var cacheKey = $"applications:user:{userId}:status:{status}:priority:{priority}:search:{normalizedSearch}:start:{startDate}:end:{endDate}:sort:{sortBy}:{sortOrder}:page:{pageNumber}:size:{pageSize}";
        
        _logger.LogInformation("Fetching applications with cache key: {CacheKey}", cacheKey);
        
        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var query = _context.Set<Application>()
                .Include(a => a.Interviews)
                .Include(a => a.Notes)
                .Include(a => a.Contacts)
                .Include(a => a.Documents)
                .Where(a => a.UserId == userId);

            // DEBUG: Count before filters
            var countBeforeFilters = await query.CountAsync();
            _logger.LogInformation("Applications before filters: {Count}", countBeforeFilters);

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(a => a.ApplicationStatus == status.Value);
                _logger.LogInformation("After status filter: {Count}", await query.CountAsync());
            }

            if (priority.HasValue)
            {
                query = query.Where(a => a.Priority == priority.Value);
                _logger.LogInformation("After priority filter: {Count}", await query.CountAsync());
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(a =>
                    a.CompanyName.ToLower().Contains(search) ||
                    a.Position.ToLower().Contains(search));
                _logger.LogInformation("After search filter: {Count}", await query.CountAsync());
            }

            // Date range filtering
            if (startDate.HasValue)
            {
                query = query.Where(a => a.ApplicationDate >= startDate.Value);
                _logger.LogInformation("After startDate filter: {Count}", await query.CountAsync());
            }

            if (endDate.HasValue)
            {
                query = query.Where(a => a.ApplicationDate <= endDate.Value);
                _logger.LogInformation("After endDate filter: {Count}", await query.CountAsync());
            }

            // Get total count
            var totalCount = await query.CountAsync();
            _logger.LogInformation("Final count before pagination: {Count}", totalCount);

            // Apply sorting
            query = ApplySorting(query, sortBy, sortOrder);

            // Apply pagination
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    CompanyName = a.CompanyName,
                    Position = a.Position,
                    Location = a.Location,
                    JobUrl = a.JobUrl,
                    ApplicationStatus = a.ApplicationStatus,
                    Priority = a.Priority,
                    Salary = a.Salary,
                    SalaryMin = a.SalaryMin,
                    SalaryMax = a.SalaryMax,
                    ApplicationDate = a.ApplicationDate,
                    ResponseDate = a.ResponseDate,
                    OfferDate = a.OfferDate,
                    InterviewCount = a.Interviews.Count,
                    NoteCount = a.Notes.Count,
                    ContactCount = a.Contacts.Count,
                    DocumentCount = a.Documents.Count,
                    CreatedUtc = a.CreatedUtc,
                    CreatedBy = a.CreatedBy,
                    UpdatedUtc = a.UpdatedUtc,
                    UpdatedBy = a.UpdatedBy
                })
                .ToListAsync();

            _logger.LogInformation("Returning {ItemCount} items out of {TotalCount}", items.Count, totalCount);

            return new PaginatedResultDto<ApplicationResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }, TimeSpan.FromMinutes(5));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving applications for user {UserId}", userId);
        throw;
    }
}

    /// <inheritdoc />
    public async Task<ApplicationResponseDto?> GetApplicationByIdAsync(int id, string userId)
    {
        try
        {
            var cacheKey = $"application:{id}:user:{userId}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var application = await _context.Set<Application>()
                    .Include(a => a.Interviews)
                    .Include(a => a.Notes)
                    .Include(a => a.Contacts)
                    .Include(a => a.Documents)
                    .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

                if (application == null)
                    return null;

                return new ApplicationResponseDto
                {
                    Id = application.Id,
                    CompanyName = application.CompanyName,
                    Position = application.Position,
                    Location = application.Location,
                    JobUrl = application.JobUrl,
                    ApplicationStatus = application.ApplicationStatus,
                    Priority = application.Priority,
                    Salary = application.Salary,
                    SalaryMin = application.SalaryMin,
                    SalaryMax = application.SalaryMax,
                    ApplicationDate = application.ApplicationDate,
                    ResponseDate = application.ResponseDate,
                    OfferDate = application.OfferDate,
                    InterviewCount = application.Interviews.Count,
                    NoteCount = application.Notes.Count,
                    ContactCount = application.Contacts.Count,
                    DocumentCount = application.Documents.Count,
                    CreatedUtc = application.CreatedUtc,
                    CreatedBy = application.CreatedBy,
                    UpdatedUtc = application.UpdatedUtc,
                    UpdatedBy = application.UpdatedBy
                };
            }, TimeSpan.FromMinutes(10));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving application {ApplicationId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ApplicationResponseDto> CreateApplicationAsync(CreateApplicationDto dto, string userId)
    {
        try
        {
            _logger.LogInformation("Creating application for user {UserId}", userId);

            // Validate salary range
            ValidateSalaryRange(dto.SalaryMin, dto.SalaryMax);

            var application = new Application
            {
                CompanyName = dto.CompanyName,
                Position = dto.Position,
                Location = dto.Location,
                JobUrl = dto.JobUrl,
                ApplicationStatus = dto.ApplicationStatus ?? ApplicationStatus.Applied,
                Priority = dto.Priority ?? ApplicationPriority.Medium,
                Salary = dto.Salary,
                SalaryMin = dto.SalaryMin,
                SalaryMax = dto.SalaryMax,
                ApplicationDate = dto.ApplicationDate ?? DateTime.UtcNow,
                JobDescription = dto.JobDescription,
                Requirements = dto.Requirements,
                UserId = userId,
            };

            _context.Set<Application>().Add(application);
            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"applications:user:{userId}:*");

            _logger.LogInformation("Created application {ApplicationId} for user {UserId}", application.Id, userId);

            return new ApplicationResponseDto
            {
                Id = application.Id,
                CompanyName = application.CompanyName,
                Position = application.Position,
                Location = application.Location,
                JobUrl = application.JobUrl,
                ApplicationStatus = application.ApplicationStatus,
                Priority = application.Priority,
                Salary = application.Salary,
                SalaryMin = application.SalaryMin,
                SalaryMax = application.SalaryMax,
                ApplicationDate = application.ApplicationDate,
                ResponseDate = application.ResponseDate,
                OfferDate = application.OfferDate,
                InterviewCount = 0,
                NoteCount = 0,
                ContactCount = 0,
                DocumentCount = 0,
                CreatedUtc = application.CreatedUtc,
                CreatedBy = application.CreatedBy,
                UpdatedUtc = application.UpdatedUtc,
                UpdatedBy = application.UpdatedBy
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating application for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ApplicationResponseDto?> UpdateApplicationAsync(int id, UpdateApplicationDto dto, string userId)
    {
        try
        {
            _logger.LogInformation("Updating application {ApplicationId} for user {UserId}", id, userId);

            var application = await _context.Applications
                .AsTracking() 
                .Include(a => a.Interviews)
                .Include(a => a.Notes)
                .Include(a => a.Contacts)
                .Include(a => a.Documents)
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (application == null)
                return null;

            // Validate salary range if being updated
            var newMin = dto.SalaryMin ?? application.SalaryMin;
            var newMax = dto.SalaryMax ?? application.SalaryMax;
            ValidateSalaryRange(newMin, newMax);

            // Update only provided fields
            if (dto.CompanyName != null)
                application.CompanyName = dto.CompanyName;

            if (dto.Position != null)
                application.Position = dto.Position;

            if (dto.Location != null)
                application.Location = dto.Location;

            if (dto.JobUrl != null)
                application.JobUrl = dto.JobUrl;

            if (dto.Priority.HasValue)
                application.Priority = dto.Priority.Value;

            if (dto.Salary.HasValue)
                application.Salary = dto.Salary;

            if (dto.SalaryMin.HasValue)
                application.SalaryMin = dto.SalaryMin;

            if (dto.SalaryMax.HasValue)
                application.SalaryMax = dto.SalaryMax;

            if (dto.ApplicationDate.HasValue)
                application.ApplicationDate = dto.ApplicationDate.Value;

            if (dto.ResponseDate.HasValue)
                application.ResponseDate = dto.ResponseDate;

            if (dto.OfferDate.HasValue)
                application.OfferDate = dto.OfferDate;

            if (dto.JobDescription != null)
                application.JobDescription = dto.JobDescription;

            if (dto.Requirements != null)
                application.Requirements = dto.Requirements;
            
            application.UpdatedUtc = DateTime.UtcNow;
            application.UpdatedBy = userId;
            
            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"applications:user:{userId}:*");
            await _cacheService.RemoveAsync($"application:{id}:user:{userId}");

            _logger.LogInformation("Updated application {ApplicationId} for user {UserId}", id, userId);

            return new ApplicationResponseDto
            {
                Id = application.Id,
                CompanyName = application.CompanyName,
                Position = application.Position,
                Location = application.Location,
                JobUrl = application.JobUrl,
                ApplicationStatus = application.ApplicationStatus,
                Priority = application.Priority,
                Salary = application.Salary,
                SalaryMin = application.SalaryMin,
                SalaryMax = application.SalaryMax,
                ApplicationDate = application.ApplicationDate,
                ResponseDate = application.ResponseDate,
                OfferDate = application.OfferDate,
                InterviewCount = application.Interviews.Count,
                NoteCount = application.Notes.Count,
                ContactCount = application.Contacts.Count,
                DocumentCount = application.Documents.Count,
                CreatedUtc = application.CreatedUtc,
                CreatedBy = application.CreatedBy,
                UpdatedUtc = application.UpdatedUtc,
                UpdatedBy = application.UpdatedBy
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating application {ApplicationId} for user {UserId}", id, userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ApplicationResponseDto?> UpdateApplicationStatusAsync(int id, ApplicationStatus status, string userId)
{
    try
    {
        _logger.LogInformation("Updating status for application {ApplicationId} to {Status} for user {UserId}", id, status, userId);

        var application = await _context.Applications
            .AsTracking() // CRITICAL: Force entity tracking
            .Include(a => a.StatusHistory)
            .Include(a => a.Interviews)
            .Include(a => a.Notes)
            .Include(a => a.Contacts)
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (application == null)
            return null;

        // Validate status transition
        ValidateStatusTransition(application.ApplicationStatus, status);

        var oldStatus = application.ApplicationStatus;
        application.ApplicationStatus = status;
        application.UpdatedUtc = DateTime.UtcNow;
        application.UpdatedBy = userId;
        
        // Set response date if status indicates company responded
        if (ShouldSetResponseDate(oldStatus, status) && application.ResponseDate == null)
            application.ResponseDate = DateTime.UtcNow;

        // Set offer date if offer received
        if (status == ApplicationStatus.Offer && application.OfferDate == null)
            application.OfferDate = DateTime.UtcNow;

        // CRITICAL: Explicitly mark as modified
        _context.Entry(application).State = EntityState.Modified;

        // Log before save
        _logger.LogInformation("Entity state before save: {State}", _context.Entry(application).State);
        
        var changeCount = await _context.SaveChangesAsync();
        
        _logger.LogInformation("SaveChanges returned {ChangeCount} changes for application {ApplicationId}", changeCount, id);
        
        if (changeCount == 0)
        {
            _logger.LogWarning("WARNING: No changes were saved to database for application {ApplicationId}!", id);
        }
        
        // Clear related cache entries
        await _cacheService.RemoveByPatternAsync($"applications:user:{userId}:*");
        await _cacheService.RemoveAsync($"application:{id}:user:{userId}");

        _logger.LogInformation("Updated status for application {ApplicationId} from {OldStatus} to {NewStatus} for user {UserId}", 
            id, oldStatus, status, userId);

        return new ApplicationResponseDto
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            Position = application.Position,
            Location = application.Location,
            JobUrl = application.JobUrl,
            ApplicationStatus = application.ApplicationStatus,
            Priority = application.Priority,
            Salary = application.Salary,
            SalaryMin = application.SalaryMin,
            SalaryMax = application.SalaryMax,
            ApplicationDate = application.ApplicationDate,
            ResponseDate = application.ResponseDate,
            OfferDate = application.OfferDate,
            InterviewCount = application.Interviews.Count,
            NoteCount = application.Notes.Count,
            ContactCount = application.Contacts.Count,
            DocumentCount = application.Documents.Count,
            CreatedUtc = application.CreatedUtc,
            CreatedBy = application.CreatedBy,
            UpdatedUtc = application.UpdatedUtc,
            UpdatedBy = application.UpdatedBy
        };
    }
    catch (InvalidOperationException ex)
    {
        _logger.LogWarning(ex, "Invalid status transition for application {ApplicationId}", id);
        throw;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating status for application {ApplicationId} for user {UserId}", id, userId);
        throw;
    }
}

    /// <inheritdoc />
    public async Task<bool> DeleteApplicationAsync(int id, string userId)
    {
        try
        {
            _logger.LogInformation("Deleting application {ApplicationId} for user {UserId}", id, userId);

            var application = await _context.Set<Application>()
                .Include(a => a.Interviews)
                .Include(a => a.Notes)
                .Include(a => a.Contacts)
                .Include(a => a.Documents)
                .Include(a => a.StatusHistory)
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (application == null)
                return false;

            // EF Core will cascade delete related entities based on your configuration
            _context.Set<Application>().Remove(application);
            await _context.SaveChangesAsync();

            // Clear related cache entries
            await _cacheService.RemoveByPatternAsync($"applications:user:{userId}:*");
            await _cacheService.RemoveAsync($"application:{id}:user:{userId}");

            _logger.LogInformation("Deleted application {ApplicationId} for user {UserId}", id, userId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting application {ApplicationId} for user {UserId}", id, userId);
            throw;
        }
    }

    #region Private Helper Methods

    private static IQueryable<Application> ApplySorting(IQueryable<Application> query, string? sortBy, string? sortOrder)
    {
        var isDescending = sortOrder?.ToLower() == "desc";

        return sortBy?.ToLower() switch
        {
            "company" => isDescending 
                ? query.OrderByDescending(a => a.CompanyName)
                : query.OrderBy(a => a.CompanyName),
            
            "position" => isDescending
                ? query.OrderByDescending(a => a.Position)
                : query.OrderBy(a => a.Position),
            
            "status" => isDescending
                ? query.OrderByDescending(a => a.ApplicationStatus)
                : query.OrderBy(a => a.ApplicationStatus),
            
            "priority" => isDescending
                ? query.OrderByDescending(a => a.Priority)
                : query.OrderBy(a => a.Priority),
            
            "date" or _ => isDescending
                ? query.OrderByDescending(a => a.ApplicationDate)
                : query.OrderBy(a => a.ApplicationDate)
        };
    }

    private static void ValidateSalaryRange(decimal? min, decimal? max)
    {
        if (min.HasValue && max.HasValue && min.Value > max.Value)
        {
            throw new InvalidOperationException("Minimum salary cannot be greater than maximum salary");
        }
    }

    private static void ValidateStatusTransition(ApplicationStatus currentStatus, ApplicationStatus newStatus)
    {
        // Can't go back to Applied from terminal states
        if (newStatus == ApplicationStatus.Applied && currentStatus == ApplicationStatus.Rejected )
        {
            throw new InvalidOperationException(
                $"Cannot change status from {currentStatus} back to {newStatus}");
        }

        // Can't go from Rejected to any other status except Applied (already blocked above)
        if (currentStatus == ApplicationStatus.Rejected && newStatus != ApplicationStatus.Rejected)
        {
            throw new InvalidOperationException(
                $"Cannot change status from Rejected to {newStatus}");
        }
    }

    private static bool ShouldSetResponseDate(ApplicationStatus oldStatus, ApplicationStatus newStatus)
    {
        // Set response date when moving from Applied to any other status that indicates company response
        return oldStatus == ApplicationStatus.Applied && 
               newStatus is ApplicationStatus.Interview or 
                          ApplicationStatus.Offer or 
                          ApplicationStatus.Rejected;
    }

    #endregion
}