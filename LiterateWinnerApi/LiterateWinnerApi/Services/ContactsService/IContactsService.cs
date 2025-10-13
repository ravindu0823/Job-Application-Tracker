using JobApplicationTrackerApi.DTO.Contacts;

namespace JobApplicationTrackerApi.Services.ContactsService;

/// <summary>
/// Service interface for managing application contacts
/// </summary>
public interface IContactsService
{
    /// <summary>
    /// Get all contacts for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>List of contacts for the application</returns>
    Task<List<ContactResponseDto>> GetContactsByApplicationAsync(int applicationId, string userId);

    /// <summary>
    /// Get a specific contact by ID
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The contact details.</returns>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.NotFoundException">Thrown if the contact is not found.</exception>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.UnauthorizedAccessException">Thrown if the user does not have access to the contact.</exception>
    Task<ContactResponseDto> GetContactByIdAsync(int id, string userId);

    /// <summary>
    /// Create a new contact
    /// </summary>
    /// <param name="createContactDto">The contact data</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The created contact</returns>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.NotFoundException">Thrown if the associated application is not found.</exception>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.UnauthorizedAccessException">Thrown if the user does not have access to the application.</exception>
    Task<ContactResponseDto> CreateContactAsync(CreateContactDto createContactDto, string userId);

    /// <summary>
    /// Update an existing contact
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <param name="updateContactDto">The updated contact data</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The updated contact</returns>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.NotFoundException">Thrown if the contact is not found.</exception>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.UnauthorizedAccessException">Thrown if the user does not have access to the contact.</exception>
    Task<ContactResponseDto> UpdateContactAsync(int id, UpdateContactDto updateContactDto, string userId);

    /// <summary>
    /// Delete a contact
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.NotFoundException">Thrown if the contact is not found.</exception>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.UnauthorizedAccessException">Thrown if the user does not have access to the contact.</exception>
    Task DeleteContactAsync(int id, string userId);

    /// <summary>
    /// Set a contact as the primary contact for an application
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.NotFoundException">Thrown if the contact is not found.</exception>
    /// <exception cref="JobApplicationTrackerApi.Exceptions.UnauthorizedAccessException">Thrown if the user does not have access to the contact.</exception>
    Task SetPrimaryContactAsync(int id, string userId);

    /// <summary>
    /// Get the primary contact for an application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="userId">The user ID</param>
    /// <returns>The primary contact or null if none exists</returns>
    Task<ContactResponseDto?> GetPrimaryContactAsync(int applicationId, string userId);

    /// <summary>
    /// Search contacts by name or email
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <param name="searchTerm">The search term</param>
    /// <param name="userId">The user ID</param>
    /// <returns>List of matching contacts</returns>
    Task<List<ContactResponseDto>> SearchContactsAsync(int applicationId, string searchTerm, string userId);
}
