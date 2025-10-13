using AutoMapper;
using JobApplicationTrackerApi.DTO.Contacts;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Infrastructure.Exceptions;
using JobApplicationTrackerApi.Services.CacheService;
using Microsoft.EntityFrameworkCore;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;

namespace JobApplicationTrackerApi.Services.ContactsService;

/// <summary>
/// Service for managing application contacts
/// </summary>
public class ContactsService(
    DefaultContext context,
    ICacheService cacheService,
    ILogger<ContactsService> logger,
    IMapper mapper
) : IContactsService
{
    private readonly DefaultContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<ContactsService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IMapper _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));

    /// <inheritdoc />
    public async Task<List<ContactResponseDto>> GetContactsByApplicationAsync(int applicationId, string userId)
    {
        var cacheKey = $"contacts_application_{applicationId}_{userId}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            // Verify the application belongs to the user
            var applicationExists = await _context.Applications
                .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

            if (!applicationExists)
            {
                throw new NotFoundException("Application not found or access denied");
            }

            var contacts = await _context.Contacts
                .Where(c => c.ApplicationId == applicationId && c.Status == CommonStatus.Active)
                .OrderBy(c => c.IsPrimaryContact ? 0 : 1)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<List<ContactResponseDto>>(contacts);
        }, TimeSpan.FromMinutes(5)) ?? [];
    }

    /// <inheritdoc />
    public async Task<ContactResponseDto> GetContactByIdAsync(int id, string userId)
    {
        var cacheKey = $"contact_{id}_{userId}";
        var contactDto = await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var contact = await _context.Contacts.AsNoTracking().Include(c => c.Application)
                .FirstOrDefaultAsync(c => c.Id == id && c.Status == CommonStatus.Active && c.Application.UserId == userId);

            return contact == null ? null : _mapper.Map<ContactResponseDto>(contact);
        }, TimeSpan.FromMinutes(10));

        return contactDto ?? throw new NotFoundException($"Contact with ID {id} not found or access denied.");
    }

    /// <inheritdoc />
    public async Task<ContactResponseDto> CreateContactAsync(CreateContactDto createContactDto, string userId)
    {
        var application = await _context.Applications
            .FirstOrDefaultAsync(a => a.Id == createContactDto.ApplicationId && a.Status == CommonStatus.Active);

        if (application == null)
        {
            throw new NotFoundException($"Application with ID {createContactDto.ApplicationId} not found.");
        }

        if (application.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User does not have access to application with ID {createContactDto.ApplicationId}.");
        }

        if (createContactDto.IsPrimaryContact)
        {
            await UnsetOtherPrimaryContacts(createContactDto.ApplicationId, null, userId);
        }

        var contact = _mapper.Map<Contact>(createContactDto);
        contact.CreatedBy = userId;
        contact.Status = CommonStatus.Active;

        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        await _cacheService.RemoveByPatternAsync($"contacts_application_{contact.ApplicationId}_{userId}");
        _logger.LogInformation("Created contact {ContactId} for application {ApplicationId}", contact.Id, contact.ApplicationId);

        return _mapper.Map<ContactResponseDto>(contact);
    }

    /// <inheritdoc />
    public async Task<ContactResponseDto> UpdateContactAsync(int id, UpdateContactDto updateContactDto, string userId)
    {
        var contact = await _context.Contacts
            .Include(c => c.Application)
            .FirstOrDefaultAsync(c => c.Id == id && c.Status == CommonStatus.Active);

        if (contact == null)
        {
            throw new NotFoundException($"Contact with ID {id} not found.");
        }

        if (contact.Application?.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User does not have access to contact with ID {id}.");
        }

        if (updateContactDto.IsPrimaryContact == true && !contact.IsPrimaryContact)
        {
            await UnsetOtherPrimaryContacts(contact.ApplicationId, id, userId);
        }

        _mapper.Map(updateContactDto, contact);
        contact.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        await _cacheService.RemoveByPatternAsync($"contacts_application_{contact.ApplicationId}_{userId}");
        await _cacheService.RemoveAsync($"contact_{id}_{userId}");
        _logger.LogInformation("Updated contact {ContactId}", contact.Id);

        return _mapper.Map<ContactResponseDto>(contact);
    }

    /// <inheritdoc />
    public async Task DeleteContactAsync(int id, string userId)
    {
        var contact = await _context.Contacts
            .Include(c => c.Application)
            .FirstOrDefaultAsync(c => c.Id == id && c.Status == CommonStatus.Active);

        if (contact == null)
        {
            // Deleting a non-existent item is idempotent, so we can just return.
            // For strictness, we could throw NotFoundException. Let's be strict.
            throw new NotFoundException($"Contact with ID {id} not found.");
        }

        if (contact.Application?.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User does not have access to contact with ID {id}.");
        }

        // Soft delete
        contact.Status = CommonStatus.Delete;
        contact.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        await _cacheService.RemoveByPatternAsync($"contacts_application_{contact.ApplicationId}_{userId}");
        await _cacheService.RemoveAsync($"contact_{id}_{userId}");
        _logger.LogInformation("Soft-deleted contact {ContactId}", id);
    }

    /// <inheritdoc />
    public async Task SetPrimaryContactAsync(int id, string userId)
    {
        var contact = await _context.Contacts
            .Include(c => c.Application)
            .FirstOrDefaultAsync(c => c.Id == id && c.Status == CommonStatus.Active);

        if (contact == null)
        {
            throw new NotFoundException($"Contact with ID {id} not found.");
        }

        if (contact.Application?.UserId != userId)
        {
            throw new UnauthorizedAccessException($"User does not have access to contact with ID {id}.");
        }

        if (contact.IsPrimaryContact)
        {
            return; // Already primary, nothing to do.
        }

        await UnsetOtherPrimaryContacts(contact.ApplicationId, id, userId);

        contact.IsPrimaryContact = true;
        contact.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        await _cacheService.RemoveByPatternAsync($"contacts_application_{contact.ApplicationId}_{userId}");
        await _cacheService.RemoveAsync($"contact_{id}_{userId}");
        _logger.LogInformation("Set contact {ContactId} as primary for application {ApplicationId}", id, contact.ApplicationId);
    }

    /// <inheritdoc />
    public async Task<ContactResponseDto?> GetPrimaryContactAsync(int applicationId, string userId)
    {
        var cacheKey = $"primary_contact_application_{applicationId}_{userId}";

        return await _cacheService.GetOrSetAsync(cacheKey, async () =>
        {
            var applicationExists = await _context.Applications
                .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

            if (!applicationExists)
            {
                throw new NotFoundException("Application not found or access denied");
            }

            var contact = await _context.Contacts
                .Where(c => c.ApplicationId == applicationId && c.IsPrimaryContact && c.Status == CommonStatus.Active)
                .FirstOrDefaultAsync();

            // Explicitly return null if not found, which is a valid cached state.
            return contact == null ? null : _mapper.Map<ContactResponseDto>(contact);
        }, TimeSpan.FromMinutes(10));
    }

    /// <inheritdoc />
    public async Task<List<ContactResponseDto>> SearchContactsAsync(int applicationId, string searchTerm, string userId)
    {
        var applicationExists = await _context.Applications
            .AnyAsync(a => a.Id == applicationId && a.UserId == userId && a.Status == CommonStatus.Active);

        if (!applicationExists)
        {
            throw new NotFoundException("Application not found or access denied");
        }

        var contacts = await _context.Contacts
            .Where(c => c.ApplicationId == applicationId &&
                       c.Status == CommonStatus.Active &&
                       (EF.Functions.Like(c.Name, $"%{searchTerm}%") ||
                        (c.Email != null && c.Email.Contains(searchTerm)) ||
                        (c.Position != null && EF.Functions.Like(c.Position, $"%{searchTerm}%"))))
            .OrderBy(c => c.IsPrimaryContact ? 0 : 1)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return _mapper.Map<List<ContactResponseDto>>(contacts);
    }

    private async Task UnsetOtherPrimaryContacts(int applicationId, int? exceptContactId, string userId)
    {
        var otherPrimaryContacts = await _context.Contacts
            .Where(c => c.ApplicationId == applicationId && c.IsPrimaryContact && c.Id != exceptContactId && c.Status == CommonStatus.Active)
            .ToListAsync();

        foreach (var other in otherPrimaryContacts)
        {
            other.IsPrimaryContact = false;
            other.UpdatedBy = userId;
        }
    }
}
