using System.Text;
using System.Text.Json;
using JobApplicationTrackerApi.DTO.Home;
using JobApplicationTrackerApi.Services.HomeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApplicationTrackerApi.Controllers;

/// <summary>
/// Root endpoint providing API metadata, useful links, and an index of available endpoints.
/// Serves HTML for browsers and JSON for API clients via content negotiation.
/// </summary>
[AllowAnonymous]
//!Ignored for swagger enable in production env.[ApiExplorerSettings(IgnoreApi = true)]
public class HomeController(
    IHomeService homeService,
    ILogger<HomeController> logger
)
    : Controller
{
    private readonly IHomeService _homeService = homeService ?? throw new ArgumentNullException(nameof(homeService));
    private readonly ILogger<HomeController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Returns API home document. HTML for browsers, JSON for API clients.
    /// </summary>
    /// <returns>API home document.</returns>
    [HttpGet("/")]
    [Produces("text/html", "application/json")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK, "text/html")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK, "application/json")]
    public async Task<IActionResult> Index()
    {
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        // Business logic is now in the HomeService
        var meta = await _homeService.GetApiMetadataAsync(baseUrl);
        var endpoints = _homeService.GetApiEndpoints();

        var accepts = request.Headers["Accept"].ToString();
        var wantsHtml = string.IsNullOrWhiteSpace(accepts) ||
                        accepts.Contains("text/html", StringComparison.OrdinalIgnoreCase);

        if (wantsHtml)
        {
            var html = BuildHtmlHome(meta, endpoints);
            return Content(html, "text/html", Encoding.UTF8);
        }

        return Ok(new { meta, endpoints });
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    /// <returns>Health status</returns>
    [HttpGet("/health")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(HealthReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(HealthReportDto), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Health()
    {
        // Business logic is now in the HomeService
        var (healthReport, isHealthy) = await _homeService.GetHealthAsync();

        if (isHealthy)
        {
            return Ok(healthReport);
        }

        // The service layer handles logging, so we just return the status code.
        return StatusCode(503, healthReport);
    }

    /// <summary>
    /// Gets API documentation and usage examples
    /// </summary>
    /// <returns>API documentation</returns>
    [HttpGet("documentation")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ApiDocumentationDto), StatusCodes.Status200OK)]
    public IActionResult GetDocumentation()
    {
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";

        // Business logic is now in the HomeService
        var documentation = _homeService.GetApiDocumentation(baseUrl);

        return Ok(documentation);
    }

    private static string BuildHtmlHome(object meta, IEnumerable<object> endpoints)
    {
        // Modern, responsive HTML landing page
        // This is presentation logic and can remain in the controller.
        var sb = new StringBuilder();
        sb.Append(
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Job Application Tracker API</title><style>");
        sb.Append(
            "body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;color:#0f172a;background:#fff;line-height:1.6}");
        sb.Append(
            "h1{font-size:32px;margin:0 0 8px;background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}");
        sb.Append(
            "h2{font-size:24px;margin:24px 0 16px;color:#1e293b}h3{font-size:18px;margin:16px 0 8px;color:#334155}");
        sb.Append(
            "p{margin:8px 0;color:#475569}.muted{color:#64748b}.card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:16px 0;background:#fafafa}");
        sb.Append(".grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}");
        sb.Append(
            "code,kbd{background:#f1f5f9;padding:4px 8px;border-radius:6px;font-family:JetBrains Mono,Consolas,monospace}");
        sb.Append("a{color:#2563eb;text-decoration:none;font-weight:500}a:hover{text-decoration:underline}");
        sb.Append(
            ".endpoints{max-height:500px;overflow:auto;border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fafafa}");
        sb.Append(
            "table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0}");
        sb.Append(
            "th{background:#f8fafc;font-weight:600;color:#374151}.status-badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}");
        sb.Append(
            ".status-healthy{background:#dcfce7;color:#166534}.status-unhealthy{background:#fef2f2;color:#dc2626}");
        sb.Append(
            ".feature-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:16px 0}");
        sb.Append(".feature-item{padding:8px 12px;background:#f1f5f9;border-radius:8px;font-size:14px}");
        sb.Append("</style></head><body>");

        // Header
        sb.Append("<h1>Job Application Tracker API</h1>");
        sb.Append(
            "<p class=\"muted\">Comprehensive RESTful API for tracking job applications, interviews, and career management. This landing page exposes key metadata and available endpoints.</p>");

        // Metadata card
        sb.Append("<div class=\"card\"><h2>API Metadata</h2><pre><code>");
        sb.Append(JsonSerializer.Serialize(meta, new JsonSerializerOptions { WriteIndented = true }));
        sb.Append("</code></pre></div>");

        // Quick links grid
        sb.Append("<div class=\"grid\">");
        sb.Append("<div class=\"card\"><h3>📚 Documentation</h3><ul>");
        sb.Append("<li><a href=\"/swagger\" target=\"_blank\">Swagger UI</a></li>");
        sb.Append("<li><a href=\"/scalar\" target=\"_blank\">Scalar UI</a></li>");
        sb.Append("<li><a href=\"/openapi/v1.json\" target=\"_blank\">OpenAPI (JSON)</a></li>");
        sb.Append("<li><a href=\"/api/home/documentation\" target=\"_blank\">API Documentation</a></li>");
        sb.Append("</ul></div>");

        sb.Append(
            "<div class=\"card\"><h3>🔧 Usage</h3><p class=\"muted\">Authorize with <code>Bearer &lt;token&gt;</code> in the <code>Authorization</code> header.</p>");
        sb.Append("<pre><code>curl -H \"Authorization: Bearer &lt;token&gt;\" /api/applications</code></pre></div>");

        sb.Append("<div class=\"card\"><h3>🏥 Health</h3><p class=\"muted\">Check API and database status.</p>");
        sb.Append("<a href=\"/health\" target=\"_blank\">Health Check</a></div>");
        sb.Append("</div>");

        // Features
        sb.Append("<div class=\"card\"><h2>✨ Features</h2><div class=\"feature-list\">");
        var features = new[]
        {
            "Job Application Management", "Interview Scheduling", "Notes & Research", "Contact Management",
            "Document Storage", "Status Tracking", "Analytics & Reporting", "Email Reminders", "Calendar Integration"
        };
        foreach (var feature in features)
        {
            sb.Append($"<div class=\"feature-item\">{feature}</div>");
        }

        sb.Append("</div></div>");

        // Endpoints table
        sb.Append(
            "<div class=\"card\"><h2>🔗 Available Endpoints</h2><div class=\"endpoints\"><table><thead><tr><th>Method</th><th>Path</th><th>Controller</th><th>Status Codes</th></tr></thead><tbody>");
        foreach (var ep in endpoints)
        {
            var method = ep.GetType().GetProperty("method")?.GetValue(ep)?.ToString() ?? "";
            var path = ep.GetType().GetProperty("path")?.GetValue(ep)?.ToString() ?? "";
            var controller = ep.GetType().GetProperty("controller")?.GetValue(ep)?.ToString() ?? "";
            var statusCodes = ep.GetType().GetProperty("supportedResponseTypes")?.GetValue(ep)?.ToString() ?? "";

            var methodColor = method switch
            {
                "GET" => "#10b981",
                "POST" => "#3b82f6",
                "PUT" => "#f59e0b",
                "PATCH" => "#8b5cf6",
                "DELETE" => "#ef4444",
                _ => "#6b7280"
            };

            sb.Append($"<tr><td><code style=\"color:{methodColor};font-weight:600\">{method}</code></td>");
            sb.Append($"<td><code>{path}</code></td>");
            sb.Append($"<td class=\"muted\">{controller}</td>");
            sb.Append($"<td class=\"muted\">{statusCodes}</td></tr>");
        }

        sb.Append("</tbody></table></div></div>");

        // Footer
        sb.Append(
            $"<p class=\"muted\">&copy; {DateTime.UtcNow.Year} Job Application Tracker API. Built with ASP.NET Core 9.0</p>");
        sb.Append("</body></html>");
        return sb.ToString();
    }
}