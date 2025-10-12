namespace JobApplicationTrackerApi.Utils;

/// <summary>
/// Represents a standardized API response structure
/// </summary>
/// <typeparam name="T">The type of data included in the response</typeparam>
public sealed class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the API operation was successful.
    /// </summary>
    public bool IsSuccess { get; set; }
    /// <summary>
    /// A human-readable message providing details about the operation's result.
    /// </summary>
    required public string Message { get; set; }
    /// <summary>
    /// The actual data payload of the response.
    /// </summary>
    required public T Data { get; set; }
    /// <summary>
    /// The UTC timestamp when the response was generated.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    /// <summary>
    /// A collection of specific error messages, often used for validation failures.
    /// </summary>
    public IEnumerable<string>? Errors { get; set; }
    /// <summary>
    /// A dictionary for any additional metadata related to the response, such as pagination details.
    /// </summary>
    public Dictionary<string, object>? Metadata { get; set; }

    /// <summary>
    /// Creates a successful API response
    /// </summary>
    /// <param name="data">The data to include in the response</param>
    /// <param name="message">Optional success message</param>
    /// <returns>A successful ApiResponse instance</returns>
    public static ApiResponse<T> Success(T data, string message = "Operation completed successfully")
    {
        return new ApiResponse<T>
        {
            IsSuccess = true,
            Message = message,
            Data = data,
            Timestamp = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Creates a failed API response
    /// </summary>
    /// <param name="message">The error message</param>
    /// <param name="errors">A list of specific errors, e.g., validation errors.</param>
    /// <returns>A failed ApiResponse instance</returns>
    public static ApiResponse<T> Failure(string message, IEnumerable<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            IsSuccess = false,
            Message = message,
            Data = default!,
            Timestamp = DateTime.UtcNow,
            Errors = errors
        };
    }
}