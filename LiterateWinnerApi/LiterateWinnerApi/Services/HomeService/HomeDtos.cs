namespace JobApplicationTrackerApi.DTO.Home;

/// <summary>
/// Represents the overall API metadata.
/// </summary>
public class ApiMetadataDto
{
    /// <summary>Gets or sets the name of the API.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the current version of the API.</summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>Gets or sets the hosting environment (e.g., Development, Production).</summary>
    public string Environment { get; set; } = string.Empty;

    /// <summary>Gets or sets the current server time in UTC.</summary>
    public DateTime ServerTimeUtc { get; set; }

    /// <summary>Gets or sets a brief description of the API's purpose.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Gets or sets the underlying framework (e.g., ASP.NET Core 9.0).</summary>
    public string Framework { get; set; } = string.Empty;

    /// <summary>Gets or sets the database technology used.</summary>
    public string Database { get; set; } = string.Empty;

    /// <summary>Gets or sets a collection of features provided by the API.</summary>
    public IEnumerable<string> Features { get; set; } = [];

    /// <summary>Gets or sets the statistics related to the database.</summary>
    public DatabaseStatisticsDto DatabaseStatistics { get; set; } = new();

    /// <summary>Gets or sets a collection of useful API-related links.</summary>
    public IEnumerable<ApiLinkDto> Links { get; set; } = [];
}

/// <summary>
/// Represents a hyperlink within the API metadata.
/// </summary>
public class ApiLinkDto
{
    /// <summary>Gets or sets the relationship of the link (e.g., "self", "health").</summary>
    public string Rel { get; set; } = string.Empty;

    /// <summary>Gets or sets the URL of the link.</summary>
    public string Href { get; set; } = string.Empty;

    /// <summary>Gets or sets a description of what the link points to.</summary>
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Represents an API endpoint discovered via ApiExplorer.
/// </summary>
public class ApiEndpointDto
{
    /// <summary>Gets or sets the name of the controller that handles the endpoint.</summary>
    public string? Controller { get; set; }

    /// <summary>Gets or sets the HTTP method (e.g., GET, POST).</summary>
    public string? Method { get; set; }

    /// <summary>Gets or sets the relative path of the endpoint.</summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>Gets or sets a collection of supported HTTP status codes for the response.</summary>
    public IEnumerable<int> SupportedResponseTypes { get; set; } = [];
}

/// <summary>
/// Represents the health status of the application and its dependencies.
/// </summary>
public class HealthReportDto
{
    /// <summary>Gets or sets the overall health status (e.g., "Healthy", "Unhealthy").</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Gets or sets the timestamp of when the health check was performed.</summary>
    public DateTime Timestamp { get; set; }

    /// <summary>Gets or sets the application's uptime in milliseconds.</summary>
    public long Uptime { get; set; }

    /// <summary>Gets or sets the hosting environment.</summary>
    public string Environment { get; set; } = string.Empty;

    /// <summary>Gets or sets the application version.</summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>Gets or sets the name of the machine hosting the application.</summary>
    public string MachineName { get; set; } = string.Empty;

    /// <summary>Gets or sets the process ID of the application.</summary>
    public int ProcessId { get; set; }

    /// <summary>Gets or sets the working set memory of the application in bytes.</summary>
    public long WorkingSet { get; set; }

    /// <summary>Gets or sets the number of processors available to the application.</summary>
    public int ProcessorCount { get; set; }

    /// <summary>Gets or sets the health status of the database.</summary>
    public HealthDatabaseDto Database { get; set; } = new();

    /// <summary>Gets or sets an error message if the health check failed.</summary>
    public string? Error { get; set; }
}

/// <summary>
/// Represents the health status of the database.
/// </summary>
public class HealthDatabaseDto
{
    /// <summary>Gets or sets a value indicating whether a connection to the database can be established.</summary>
    public bool Connected { get; set; }

    /// <summary>Gets or sets the database provider name (e.g., "Microsoft.EntityFrameworkCore.SqlServer").</summary>
    public string? Provider { get; set; }

    /// <summary>Gets or sets detailed statistics from the database.</summary>
    public DatabaseStatisticsDto? Statistics { get; set; }
}

/// <summary>
/// Represents statistics from the database.
/// </summary>
public class DatabaseStatisticsDto
{
    /// <summary>Gets or sets a value indicating whether a connection to the database can be established.</summary>
    public bool Connected { get; set; }

    /// <summary>Gets or sets the database provider name.</summary>
    public string? Provider { get; set; }

    /// <summary>Gets or sets a message related to the database status (e.g., "Database unavailable").</summary>
    public string? Message { get; set; }

    /// <summary>Gets or sets an error message if fetching statistics failed.</summary>
    public string? Error { get; set; }

    /// <summary>Gets or sets the record counts for various tables.</summary>
    public DbTableStatsDto? Statistics { get; set; }
}

/// <summary>
/// Contains record counts for various tables in the database.
/// </summary>
public class DbTableStatsDto
{
    /// <summary>Gets or sets the total number of applications.</summary>
    public int Applications { get; set; }

    /// <summary>Gets or sets the total number of interviews.</summary>
    public int Interviews { get; set; }

    /// <summary>Gets or sets the total number of notes.</summary>
    public int Notes { get; set; }

    /// <summary>Gets or sets the total number of contacts.</summary>
    public int Contacts { get; set; }

    /// <summary>Gets or sets the total number of documents.</summary>
    public int Documents { get; set; }

    /// <summary>Gets or sets the total number of status history records.</summary>
    public int StatusHistory { get; set; }
}

/// <summary>
/// Represents the API documentation structure.
/// </summary>
public class ApiDocumentationDto
{
    /// <summary>Gets or sets the title of the documentation.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the version of the API being documented.</summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>Gets or sets a description of the API.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Gets or sets the base URL for the API.</summary>
    public string BaseUrl { get; set; } = string.Empty;

    /// <summary>Gets or sets details about API authentication.</summary>
    public AuthDocumentationDto Authentication { get; set; } = new();

    /// <summary>Gets or sets information about common HTTP headers.</summary>
    public CommonHeadersDto CommonHeaders { get; set; } = new();

    /// <summary>Gets or sets a dictionary of common response formats and their meanings.</summary>
    public Dictionary<string, ResponseFormatDto> ResponseFormats { get; set; } = [];
}

/// <summary>
/// Represents authentication details for the API documentation.
/// </summary>
public class AuthDocumentationDto
{
    /// <summary>Gets or sets the type of authentication (e.g., "JWT Bearer Token").</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Gets or sets a description of how to authenticate.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Gets or sets the format of the authentication header.</summary>
    public string Header { get; set; } = string.Empty;
}

/// <summary>
/// Represents common HTTP headers used in the API.
/// </summary>
public class CommonHeadersDto
{
    /// <summary>Gets or sets the expected content type for request bodies.</summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>Gets or sets the recommended accept header for clients.</summary>
    public string Accept { get; set; } = string.Empty;
}

/// <summary>
/// Represents a standard response format with a status code and description.
/// </summary>
public class ResponseFormatDto
{
    /// <summary>Gets or sets the HTTP status code.</summary>
    public int StatusCode { get; set; }

    /// <summary>Gets or sets the description of what this status code means in the API context.</summary>
    public string Description { get; set; } = string.Empty;
}