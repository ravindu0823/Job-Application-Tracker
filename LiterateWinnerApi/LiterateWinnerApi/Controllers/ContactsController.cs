using JobApplicationTrackerApi.DTO.Contacts;
using JobApplicationTrackerApi.Services.ContactsService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Controller for managing application contacts
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContactsController(
    IContactsService contactsService,
    IIdentityService identityService,
    ILogger<ContactsController> logger
) : ControllerBase
{
    private readonly IContactsService _contactsService = contactsService ?? throw new ArgumentNullException(nameof(contactsService));
    private readonly IIdentityService _identityService = identityService ?? throw new ArgumentNullException(nameof(identityService));
    private readonly ILogger<ContactsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Get all contacts for a specific application
    /// </summary>
    /// <param name="applicationId">The application ID</param>
    /// <returns>List of contacts for the application</returns>
    [HttpGet("application/{applicationId:int}")]
    [ProducesResponseType(typeof(ApiResponse<List<ContactResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetContactsByApplication(int applicationId)
    {
        var userId = GetUserId();
        var contacts = await _contactsService.GetContactsByApplicationAsync(applicationId, userId);
        return Ok(ApiResponse<List<ContactResponseDto>>.Success(contacts, "Contacts retrieved successfully"));
    }

    /// <summary>
    /// Get a specific contact by ID
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <returns>The contact details</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ContactResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetContact(int id)
    {
        var userId = GetUserId();
        var contact = await _contactsService.GetContactByIdAsync(id, userId);
        // The service layer now guarantees a non-null return or throws an exception.
        return Ok(ApiResponse<ContactResponseDto>.Success(contact, "Contact retrieved successfully"));
    }

    /// <summary>
    /// Create a new contact
    /// </summary>
    /// <param name="createContactDto">The contact data</param>
    /// <returns>The created contact</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ContactResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateContact([FromBody] CreateContactDto createContactDto)
    {
        var userId = GetUserId();
        var contact = await _contactsService.CreateContactAsync(createContactDto, userId);
        return CreatedAtAction(nameof(GetContact), new { id = contact.Id },
            ApiResponse<ContactResponseDto>.Success(contact, "Contact created successfully"));
    }

    /// <summary>
    /// Update an existing contact
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <param name="updateContactDto">The updated contact data</param>
    /// <returns>The updated contact</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ContactResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateContact(int id, [FromBody] UpdateContactDto updateContactDto)
    {
        var userId = GetUserId();
        var contact = await _contactsService.UpdateContactAsync(id, updateContactDto, userId);
        return Ok(ApiResponse<ContactResponseDto>.Success(contact, "Contact updated successfully"));
    }

    /// <summary>
    /// Delete a contact
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteContact(int id)
    {
        var userId = GetUserId();
        await _contactsService.DeleteContactAsync(id, userId);
        return Ok(ApiResponse<object>.Success(new object(), "Contact deleted successfully"));
    }

    /// <summary>
    /// Set a contact as the primary contact for an application
    /// </summary>
    /// <param name="id">The contact ID</param>
    /// <returns>Success response</returns>
    [HttpPatch("{id:int}/set-primary")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SetPrimaryContact(int id)
    {
        var userId = GetUserId();
        await _contactsService.SetPrimaryContactAsync(id, userId);
        return Ok(ApiResponse<object>.Success(new object(), "Contact set as primary successfully"));
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
