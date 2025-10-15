using JobApplicationTrackerApi;
using JobApplicationTrackerApi.Infrastructure.Middleware;
using JobApplicationTrackerApi.Startup;
using Scalar.AspNetCore;
using Serilog;

Console.WriteLine("Starting .....");

// Check if we should run migrations directly (skipping the whole application startup)
// This avoids Redis connection issues when trying to run migrations
MigrationRunner.RunMigrations(args);

// Configure thread pool for high concurrency
ThreadPool.GetMinThreads(out int workerThreads, out int completionPortThreads);
int newWorkerThreads = Environment.ProcessorCount * 32;
int newCompletionPortThreads = Environment.ProcessorCount * 32;
ThreadPool.SetMinThreads(
    Math.Max(workerThreads, newWorkerThreads),
    Math.Max(completionPortThreads, newCompletionPortThreads));

Console.WriteLine(
    $"Thread pool configured with min worker threads: {newWorkerThreads}, completion port threads: {newCompletionPortThreads}");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Host.UseSerilog((context, services, loggerConfig) => loggerConfig
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

// Register application services from DependencyInjection.cs
builder.Services.RegisterServices();

// Register endpoints API explorer and HTTP context accessor
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// Using in-process OutputCache (configured in DI); no Redis output cache required when Redis is absent

var app = builder.Build();

// Enable middleware for concurrency and performance
app.UseResponseCompression();
app.UseResponseCaching();
// app.UseOutputCache();
app.UseRateLimiter();

app.UseOpenApi();
app.UseSwagger(options => { options.RouteTemplate = "/openapi/{documentName}.json"; });
app.UseSwagger();
app.UseSwaggerUI();
app.MapScalarApiReference();
app.UseSerilogRequestLogging();

// Add monitoring middleware (it will check configuration to see if it should run)
// app.UseMiddleware<MonitoringMiddleware>();

// Add request context logging middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
app.UseMiddleware<RequestContextLoggingMiddleware>();



app.UseStaticFiles();

// Correct order for CORS and SignalR: routing first, then CORS, then auth
app.UseRouting();

// CORS middleware - must be after UseRouting and before UseAuthorization
app.UseCors(x => x
    .SetIsOriginAllowed(_ => true) // For development - in production, specify your origins
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
);

// Authentication & endpoint mapping
app.UseAuthorization();

app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.ApplyMigrations();
    app.UseHttpsRedirection();
}

app.Run();

// Make Program class accessible for integration testing
/// <summary>
///
/// </summary>
public partial class Program { }