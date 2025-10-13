using AutoMapper;
using FluentAssertions;
using JobApplicationTrackerApi.DTO.Contacts;
using JobApplicationTrackerApi.Infrastructure.Exceptions;
using JobApplicationTrackerApi.Mappings;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using JobApplicationTrackerApi.Services.ContactsService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace JobApplicationTrackerApi.Tests.UnitTests.Services;

public class ContactsServiceTests
{
    private readonly DbContextOptions<DefaultContext> _dbContextOptions;
    private readonly IMapper _mapper;
    private readonly Mock<ICacheService> _cacheServiceMock;
    private readonly Mock<ILogger<ContactsService>> _loggerMock;
    private readonly string _authorizedUserId = "user-authorized";
    private readonly string _unauthorizedUserId = "user-unauthorized";

    public ContactsServiceTests()
    {
        // Use an in-memory database for testing
        _dbContextOptions = new DbContextOptionsBuilder<DefaultContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        // Configure AutoMapper
        var mappingConfig = new MapperConfiguration(mc => { mc.AddProfile(new ContactsMappingProfile()); });
        _mapper = mappingConfig.CreateMapper();

        _loggerMock = new Mock<ILogger<ContactsService>>();
        _cacheServiceMock = new Mock<ICacheService>();

        // Mock the cache to bypass it and execute the factory method directly.
        // This ensures we are testing the database logic, not the cache.
        _cacheServiceMock.Setup(c => c.GetOrSetAsync(It.IsAny<string>(), It.IsAny<Func<Task<ContactResponseDto?>>>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>()))
            .Returns((string key, Func<Task<ContactResponseDto?>> factory, TimeSpan? expiry, bool useSliding) => factory());
        _cacheServiceMock.Setup(c => c.GetOrSetAsync(It.IsAny<string>(), It.IsAny<Func<Task<List<ContactResponseDto>>>>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>()))
            .Returns((string key, Func<Task<List<ContactResponseDto>>> factory, TimeSpan? expiry, bool useSliding) => factory());

        // Seed the database for tests
        SeedDatabase();
    }

    private void SeedDatabase()
    {
        using var context = new DefaultContext(_dbContextOptions);
        
        var application = new Application
        {
            Id = 1,
            UserId = _authorizedUserId,
            CompanyName = "Test Inc.",
            Position = "Tester"
        };

        var contact = new Contact
        {
            Id = 1,
            ApplicationId = 1,
            Name = "John Doe",
            Email = "john.doe@test.com",
            Application = application
        };

        context.Applications.Add(application);
        context.Contacts.Add(contact);
        context.SaveChanges();
    }

    [Fact]
    public async Task GetContactByIdAsync_WhenUserIsAuthorized_ShouldReturnContact()
    {
        // Arrange
        await using var context = new DefaultContext(_dbContextOptions);
        var service = new ContactsService(context, _cacheServiceMock.Object, _loggerMock.Object, _mapper);
        var contactId = 1;

        // Act
        var result = await service.GetContactByIdAsync(contactId, _authorizedUserId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(contactId);
        result.Name.Should().Be("John Doe");
    }

    [Fact]
    public async Task GetContactByIdAsync_WhenUserIsUnauthorized_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        await using var context = new DefaultContext(_dbContextOptions);
        var service = new ContactsService(context, _cacheServiceMock.Object, _loggerMock.Object, _mapper);
        var contactId = 1;

        // Act
        Func<Task> act = () => service.GetContactByIdAsync(contactId, _unauthorizedUserId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Contact with ID {contactId} not found or access denied.");
    }
    
    [Fact]
    public async Task GetContactByIdAsync_WhenContactNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        await using var context = new DefaultContext(_dbContextOptions);
        var service = new ContactsService(context, _cacheServiceMock.Object, _loggerMock.Object, _mapper);
        var nonExistentContactId = 999;

        // Act
        Func<Task> act = () => service.GetContactByIdAsync(nonExistentContactId, _authorizedUserId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"Contact with ID {nonExistentContactId} not found or access denied.");
    }

    [Fact]
    public async Task CreateContactAsync_WhenUserIsAuthorized_ShouldCreateAndReturnContact()
    {
        // Arrange
        await using var context = new DefaultContext(_dbContextOptions);
        var service = new ContactsService(context, _cacheServiceMock.Object, _loggerMock.Object, _mapper);
        var createDto = new CreateContactDto
        {
            ApplicationId = 1,
            Name = "Jane Smith",
            Email = "jane.smith@test.com"
        };

        // Act
        var result = await service.CreateContactAsync(createDto, _authorizedUserId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Jane Smith");
        
        var contactInDb = await context.Contacts.FindAsync(result.Id);
        contactInDb.Should().NotBeNull();
        contactInDb!.Name.Should().Be("Jane Smith");
    }

    [Fact]
    public async Task CreateContactAsync_WhenApplicationBelongsToAnotherUser_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        await using var context = new DefaultContext(_dbContextOptions);
        var service = new ContactsService(context, _cacheServiceMock.Object, _loggerMock.Object, _mapper);
        var createDto = new CreateContactDto
        {
            ApplicationId = 1, // This application belongs to _authorizedUserId
            Name = "Intruder",
            Email = "intruder@test.com"
        };

        // Act
        // Attempt to create a contact as an unauthorized user for an application they don't own
        Func<Task> act = () => service.CreateContactAsync(createDto, _unauthorizedUserId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage($"User does not have access to application with ID {createDto.ApplicationId}.");
    }
}