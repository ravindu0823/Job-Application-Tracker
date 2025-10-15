using System.Net;
using System.Text.Json;
using JobApplicationTrackerApi.Infrastructure.Exceptions;
using JobApplicationTrackerApi.Utils;

namespace JobApplicationTrackerApi.Infrastructure.Middleware;
/// <summary>
///
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
/// <summary>
///
/// </summary>
/// <param name="next"></param>
/// <param name="logger"></param>
    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
/// <summary>
///
/// </summary>
/// <param name="context"></param>
/// <returns></returns>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        HttpStatusCode statusCode;
        string message;

        switch (exception)
        {
            case NotFoundException notFoundException:
                statusCode = HttpStatusCode.NotFound;
                message = notFoundException.Message;
                _logger.LogWarning(notFoundException, "Resource not found: {Message}", message);
                break;
            case UnauthorizedAccessException:
                statusCode = HttpStatusCode.Unauthorized;
                message = exception.Message;
                _logger.LogWarning(exception, "Unauthorized access attempt: {Message}", message);
                break;
            case InvalidOperationException:
                // This is now used for invalid operations, not for 'Not Found' cases.
                statusCode = HttpStatusCode.BadRequest;
                message = exception.Message;
                _logger.LogWarning(exception, "Invalid operation: {Message}", message);
                break;
            // Add more specific exception types here if needed
            // case FluentValidation.ValidationException validationException:
            //     statusCode = HttpStatusCode.BadRequest;
            //     message = "One or more validation errors occurred.";
            //     // You could serialize validationException.Errors here
            //     break;
            default:
                statusCode = HttpStatusCode.InternalServerError;
                message = "An unexpected internal server error has occurred.";
                _logger.LogError(exception, "An unhandled exception has occurred: {ExceptionMessage}", exception.Message);
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.Failure(message);
        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        return context.Response.WriteAsync(jsonResponse);
    }
}