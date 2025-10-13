using System.Diagnostics.Metrics;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.Redis.StackExchange;
using JobApplicationTrackerApi.Infrastructure.Options;
using JobApplicationTrackerApi.Persistence;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Persistence.IdentityContext;
using JobApplicationTrackerApi.Persistence.IdentityContext.Entity;
using JobApplicationTrackerApi.Services.CacheService;
using JobApplicationTrackerApi.Services.ConcurrencyService;
using JobApplicationTrackerApi.Services.IdentityErrorHandlerService;
using JobApplicationTrackerApi.Services.IdentityService;
using JobApplicationTrackerApi.Services.MonitoringService;
using JobApplicationTrackerApi.Services.TokenService;
using JobApplicationTrackerApi.Services.NotesService;
using JobApplicationTrackerApi.Services.ContactsService;
using JobApplicationTrackerApi.Services.StatisticsService;
using JobApplicationTrackerApi.Mappings;
using JobApplicationTrackerApi.SignalR;
using LiterateWinnerApi.Services.CacheService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Serilog;
using StackExchange.Redis;
using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace JobApplicationTrackerApi.Startup;

/// <summary>
/// Extension methods to register services in the DI container
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Register all services for the application
    /// </summary>
    public static IServiceCollection RegisterServices(this IServiceCollection services)
    {
        // Get the service provider to resolve configuration
        var serviceProvider = services.BuildServiceProvider();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();

        // Register options
        services.RegisterOptions(configuration);

        // Register Swagger
        services.RegisterSwaggerGen();

        // Register DB contexts
        services.RegisterDbContexts(configuration);

        // Register Redis and caching services
        services.RegisterRedisServices(configuration);

        // Register response compression
        services.RegisterResponseCompression();

        // Register JSON serialization
        services.RegisterJsonSerialization();

        // Register Hangfire
        // services.RegisterHangfire(configuration);

        // Register Serilog
        services.RegisterSeriLogsServices();

        // Register custom services
        services.RegisterCustomServices();

        // Register identity services
        services.RegisterIdentity();

        // Register authentication and authorization
        services.RegisterAuthentication(configuration);
        services.RegisterAuthorization();

        // Register SignalR
        services.RegisterSignalR();

        // Register background services
        services.RegisterBackgroundServices();

        // Register caching services
        services.RegisterCachingServices();

        // Register OpenTelemetry and metrics
        // services.RegisterOpenTelemetryAndMetrics();

        // Register HTTP clients
        services.RegisterHttpClients();

        // Register CORS
        services.RegisterCors();

        // Register monitoring services
        services.RegisterMonitoringServices();

        // Register rate limiting
        services.AddRateLimiting();

        // Configure request timeouts
        services.AddRequestTimeouts(options =>
        {
            // Default timeout for all endpoints
            options.DefaultPolicy = new RequestTimeoutPolicy
            {
                Timeout = TimeSpan.FromSeconds(30)
            };

            // Special policies for specific endpoints
            options.AddPolicy("LongRunningOperation", new RequestTimeoutPolicy
            {
                Timeout = TimeSpan.FromMinutes(5)
            });

            options.AddPolicy("QuickOperation", new RequestTimeoutPolicy
            {
                Timeout = TimeSpan.FromSeconds(5)
            });
        });

        return services;
    }

    private static IServiceCollection RegisterOptions(this IServiceCollection services, IConfiguration configuration)
    {
        // Register JWT options
        services.Configure<JwtOptions>(
            configuration.GetSection(JwtOptions.Key));

        // Validate JWT options
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.Key))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var problemDetails = new ValidationProblemDetails(context.ModelState)
                {
                    Instance = context.HttpContext.Request.Path,
                    Status = StatusCodes.Status400BadRequest,
                    Detail = "Please refer to the errors property for additional details."
                };

                return new BadRequestObjectResult(problemDetails)
                {
                    ContentTypes = { "application/problem+json" }
                };
            };
        });

        return services;
    }

    private static IServiceCollection RegisterSwaggerGen(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Literate Winner Api",
                Version = "v1",
                Description =
                    "API for Literate Winner"
            });

            var jwtSecurityScheme = new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme,
                BearerFormat = "JWT",
                Description = "Enter JWT Bearer token **_only_**",
                Reference = new OpenApiReference
                {
                    Id = JwtBearerDefaults.AuthenticationScheme,
                    Type = ReferenceType.SecurityScheme
                }
            };

            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, jwtSecurityScheme);


            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { jwtSecurityScheme, [] }
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
        });

        return services;
    }

    private static IServiceCollection RegisterDbContexts(this IServiceCollection services, IConfiguration configuration)
    {
        try
        {
            // Register enhanced connection manager
            services.AddSingleton<DbConnectionManager>();

            // Get the current environment to conditionally register database providers
            var serviceProvider = services.BuildServiceProvider();
            var environment = serviceProvider.GetRequiredService<IHostEnvironment>();

            // Skip database registration for Testing environment - it will be handled by test setup
            if (environment.EnvironmentName == "Testing")
            {
                return services;
            }

            // Calculate optimal pool size based on available processors
            var poolSize = Math.Min(128, Environment.ProcessorCount * 8);

            // Validate connection string is available
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException(
                    "Database connection string 'DefaultConnection' is missing or empty");
            }

            // Register DefaultContext with optimized settings
            services.AddDbContextPool<DefaultContext>(options =>
            {
                options.UseSqlServer(connectionString,
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                        sqlOptions.CommandTimeout(30);
                        sqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                        // Add batch size optimizations for better performance
                        sqlOptions.MinBatchSize(10);
                        sqlOptions.MaxBatchSize(100);
                    });

                // Set optimal tracking behavior for better performance
                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTrackingWithIdentityResolution);

                // Enable sensitive data logging only in development
                if (environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                }
            }, poolSize); // Set explicit pool size

            // Register IdentityContext with optimized settings
            services.AddDbContextPool<IdentityContext>(options =>
            {
                options.UseSqlServer(connectionString,
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                        sqlOptions.CommandTimeout(30);
                    });

                // Enable sensitive data logging only in development
                if (environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                }
            }, poolSize); // Set explicit pool size
        }
        catch (Exception ex)
        {
            // Log the error but don't try to resolve ILogger since that may fail too
            Console.Error.WriteLine($"Error registering DbContext services: {ex.Message}");
        }

        return services;
    }

    private static IServiceCollection RegisterSeriLogsServices(this IServiceCollection services)
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .Build();

        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .CreateLogger();

        return services;
    }

    private static IServiceCollection RegisterCustomServices(this IServiceCollection services)
    {
        // Register identity services
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IIdentityErrorHandlerService, IdentityErrorHandlerService>();
        services.AddScoped<ITokenService, TokenService>();

        // Register Notes and Contacts services
        services.AddScoped<INotesService, NotesService>();
        services.AddScoped<IContactsService, ContactsService>();

        // Register Statistics service
        services.AddScoped<IStatisticsService, StatisticsService>();

        // Register AutoMapper
        services.AddAutoMapper(typeof(NotesMappingProfile), typeof(ContactsMappingProfile));

        return services;
    }

    private static IServiceCollection RegisterIdentity(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                // options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<IdentityContext>()
            .AddDefaultTokenProviders();

        return services;
    }

    private static IServiceCollection RegisterAuthentication(this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure JWT authentication
        var jwtSection = configuration.GetSection(JwtOptions.Key);
        var jwtOptions = jwtSection.Get<JwtOptions>();

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false; // Set to true in production
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions?.Issuer,
                    ValidAudience = jwtOptions?.Audience,
                    IssuerSigningKey =
                        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions?.SecurityKey ?? string.Empty)),
                    ClockSkew = TimeSpan.Zero
                };

                // Add JWT validation for SignalR
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        // Allow the JWT token to be passed in the query string for SignalR connections
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }

    private static IServiceCollection RegisterAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization();
        return services;
    }

    private static IServiceCollection RegisterSignalR(this IServiceCollection services)
    {
        // Get the environment from the service provider
        var serviceProvider = services.BuildServiceProvider();
        var environment = serviceProvider.GetRequiredService<IHostEnvironment>();

        services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = environment.IsDevelopment();
                options.MaximumReceiveMessageSize = 2 * 1024 * 1024; // Increased to 2MB
                options.StreamBufferCapacity = 100; // Increased from 20 to 100 for higher concurrency
                options.MaximumParallelInvocationsPerClient = 5;
                options.ClientTimeoutInterval = TimeSpan.FromMinutes(2);
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            })
            .AddJsonProtocol(options =>
                {
                    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                    options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                }
            );

        services.AddSingleton<IUserIdProvider, NameUserIdProvider>();
        return services;
    }

    private static IServiceCollection RegisterBackgroundServices(this IServiceCollection services)
    {
        return services;
    }

    private static IServiceCollection RegisterCachingServices(this IServiceCollection services)
    {
        // Register cache and concurrency services
        services.AddSingleton<ICacheService, CacheService>();
        services.AddScoped<IConcurrencyService, ConcurrencyService>();

        return services;
    }

    private static IServiceCollection RegisterHttpClients(this IServiceCollection services)
    {
        // Configure HttpClientFactoryOptions for all clients
        services.Configure<HttpClientFactoryOptions>(options =>
        {
            options.HttpMessageHandlerBuilderActions.Add(builder =>
            {
                builder.PrimaryHandler = new SocketsHttpHandler
                {
                    PooledConnectionLifetime = TimeSpan.FromMinutes(10),
                    MaxConnectionsPerServer = 100,
                    EnableMultipleHttp2Connections = true
                };
            });
        });

        return services;
    }

    private static IServiceCollection RegisterRedisServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        try
        {
            // Retrieve the Redis connection string
            var redisConnection = configuration.GetConnectionString("cache");

            var useRedis = !string.IsNullOrWhiteSpace(redisConnection);

            if (useRedis)
            {
                // Ensure abortConnect=false is present in the connection string
                if (!redisConnection!.Contains("abortConnect=false", StringComparison.OrdinalIgnoreCase))
                {
                    redisConnection += ",abortConnect=false";
                }

                // Register IConnectionMultiplexer as a singleton with resilient configuration
                var redisOptions = ConfigurationOptions.Parse(redisConnection);
                redisOptions.AbortOnConnectFail = false;
                redisOptions.ConnectRetry = 5;
                redisOptions.ConnectTimeout = 5000;

                try
                {
                    var multiplexer = ConnectionMultiplexer.Connect(redisOptions);
                    services.AddSingleton<IConnectionMultiplexer>(multiplexer);

                    // Register distributed cache with Redis only if connection succeeded
                    services.AddStackExchangeRedisCache(options =>
                    {
                        options.Configuration = redisConnection;
                        options.InstanceName = "LiterateWinnerApi:";
                    });
                }
                catch (Exception ex)
                {
                    // Log the error but don't let it crash the application
                    Console.Error.WriteLine(
                        $"Failed to connect to Redis: {ex.Message}. Using in-memory distributed cache instead.");

                    services.AddDistributedMemoryCache();
                }
            }
            else
            {
                // Fall back to in-memory distributed cache when no Redis configured
                services.AddDistributedMemoryCache();
            }
        }
        catch (Exception ex)
        {
            // Log the error but don't let it crash the application
            Console.Error.WriteLine($"Failed to register Redis services: {ex.Message}. Using in-memory cache instead.");

            // Fall back to in-memory cache
            services.AddDistributedMemoryCache();
        }

        // Add memory cache for local caching
        services.AddMemoryCache(options =>
        {
            // Set size limits - requiring all entries to specify a size
            options.SizeLimit = 1024 * 1024 * 100; // 100 MB
        });

        // Configure cache profiles for response caching
        services.AddResponseCaching();

        // Add output caching
        services.AddOutputCache(options =>
        {
            // Default policy
            options.AddBasePolicy(policyBuilder =>
                policyBuilder.Expire(TimeSpan.FromSeconds(30))
                    .SetVaryByHost(true)
                    .Tag("default"));

            // Policy for public timelines
            options.AddPolicy("PublicTimeline", cachePolicyBuilder =>
                cachePolicyBuilder.Expire(TimeSpan.FromSeconds(60))
                    .SetVaryByHost(true)
                    .SetVaryByQuery("page", "pageSize")
                    .Tag("timeline"));
        });

        return services;
    }

    private static IServiceCollection RegisterResponseCompression(this IServiceCollection services)
    {
        // Enable response compression
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
            options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
                ["application/json", "application/graphql"]);
        });

        services.Configure<BrotliCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });
        services.Configure<GzipCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });

        return services;
    }

    private static IServiceCollection RegisterJsonSerialization(this IServiceCollection services)
    {
        // Configure JSON serialization with high performance settings
        services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        services.Configure<MvcNewtonsoftJsonOptions>(options =>
        {
            options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        });

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

        return services;
    }

    private static IServiceCollection RegisterHangfire(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Hangfire for robust background processing
        var redisConnection = configuration.GetConnectionString("cache") ?? "localhost:6379";
        services.AddHangfire(config =>
        {
            config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseRedisStorage(redisConnection, new RedisStorageOptions
                {
                    Prefix = "LiterateWinnerApi:hangfire:",
                    InvisibilityTimeout = TimeSpan.FromHours(1),
                    ExpiryCheckInterval = TimeSpan.FromHours(1)
                });

            // Add retry policies for social activities
            config.UseFilter(new AutomaticRetryAttribute
            {
                Attempts = 5,
                DelaysInSeconds = [10, 30, 60, 300, 600],
                OnAttemptsExceeded = AttemptsExceededAction.Delete
            });
        });

        // Register the custom job activator
        services.AddSingleton<AspNetCoreJobActivator>();
        services.AddSingleton<JobActivator>(sp => sp.GetRequiredService<AspNetCoreJobActivator>());

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 5;
            options.Queues = ["default"];
            options.ServerName = $"literate-winner-api-{Environment.MachineName}";
            options.SchedulePollingInterval = TimeSpan.FromSeconds(5); // Poll more frequently
            options.ShutdownTimeout = TimeSpan.FromSeconds(30); // Allow time for jobs to complete
        });

        return services;
    }

    private static IServiceCollection RegisterCors(this IServiceCollection services)
    {
        // Add CORS configuration - properly configured for SignalR
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.SetIsOriginAllowed(_ => true) // For development - in production, specify your origins
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        return services;
    }

    // Add the new monitoring services registration method
    private static IServiceCollection RegisterMonitoringServices(this IServiceCollection services)
    {
        // Create a shared meter for monitoring
        var meter = new Meter("LiterateWinnerApi", "1.0.0");
        services.AddSingleton(meter);

        // Register monitoring service
        services.AddSingleton<IMonitoringService, MonitoringService>();

        // Add request tracking middleware
        services.AddScoped<RequestTracking>();

        return services;
    }

    private static IServiceCollection AddRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // Set up a named policy for authenticated users
            options.AddFixedWindowLimiter("authenticated_api", window =>
            {
                window.Window = TimeSpan.FromSeconds(10);
                window.PermitLimit = 100;
                window.QueueLimit = 0;
            });

            // Set up a more restrictive policy for anonymous users
            options.AddFixedWindowLimiter("anonymous_api", window =>
            {
                window.Window = TimeSpan.FromSeconds(10);
                window.PermitLimit = 20;
                window.QueueLimit = 0;
            });

            // Set up a policy for auth endpoints
            options.AddTokenBucketLimiter("auth_endpoints", bucket =>
            {
                bucket.TokenLimit = 10;
                bucket.QueueLimit = 0;
                bucket.ReplenishmentPeriod = TimeSpan.FromSeconds(60);
                bucket.TokensPerPeriod = 10;
            });

            // Set up a policy for chat endpoints with higher limits
            options.AddFixedWindowLimiter("chat_endpoints", window =>
            {
                window.Window = TimeSpan.FromSeconds(10);
                window.PermitLimit = 60; // Higher limit for chat operations
                window.QueueLimit = 10; // Allow some queuing for chat
            });

            // Global rate limiting - used as fallback
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                // Get user IP address
                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                // Get current endpoint
                var endpoint = context.GetEndpoint()?.DisplayName ?? "";

                // Check if user is authenticated
                var isAuthenticated = context.User.Identity?.IsAuthenticated ?? false;

                // For auth endpoints, use specific limiter
                if (endpoint.Contains("Auth"))
                {
                    return RateLimitPartition.GetTokenBucketLimiter(ipAddress,
                        _ => new TokenBucketRateLimiterOptions
                        {
                            TokenLimit = 10,
                            QueueLimit = 0,
                            ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                            TokensPerPeriod = 10
                        });
                }

                // For chat endpoints, use chat-specific limiter
                if (endpoint.Contains("Chat"))
                {
                    return RateLimitPartition.GetFixedWindowLimiter(ipAddress,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            Window = TimeSpan.FromSeconds(10),
                            PermitLimit = 60,
                            QueueLimit = 10
                        });
                }

                // For authenticated users
                if (isAuthenticated)
                {
                    return RateLimitPartition.GetFixedWindowLimiter(ipAddress,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            Window = TimeSpan.FromSeconds(10),
                            PermitLimit = 50,
                            QueueLimit = 0
                        });
                }

                // For anonymous users - more restrictive
                return RateLimitPartition.GetFixedWindowLimiter(ipAddress,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        Window = TimeSpan.FromSeconds(10),
                        PermitLimit = 10,
                        QueueLimit = 0
                    });
            });

            // Configure rate limit response
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.HttpContext.Response.ContentType = "application/json";

                var response = new
                {
                    status = (int)HttpStatusCode.TooManyRequests,
                    title = "Too many requests",
                    detail = "You have exceeded the rate limit. Please try again later.",
                    retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
                        ? retryAfter.TotalSeconds
                        : 10
                };

                await context.HttpContext.Response.WriteAsJsonAsync(response, token);
            };
        });

        return services;
    }

    // Custom JobActivator class for Hangfire
    public class AspNetCoreJobActivator(IServiceScopeFactory serviceScopeFactory) : JobActivator
    {
        public override object ActivateJob(Type jobType)
        {
            return serviceScopeFactory.CreateScope().ServiceProvider.GetRequiredService(jobType);
        }
    }

    // Hangfire dashboard authorization filter
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();

            // In production, implement proper authorization
            // For development, allow local access
            return httpContext.Connection.LocalIpAddress != null;
        }
    }

    // Request tracking class for monitoring
    public class RequestTracking(IMonitoringService monitoringService)
    {
        public void TrackRequest(string endpoint, string method)
        {
            monitoringService.RecordRequestStart(endpoint, method);
        }

        public void TrackResponse(string endpoint, string method, double elapsedMs, bool isSuccess)
        {
            monitoringService.RecordRequestEnd(endpoint, method, elapsedMs, isSuccess);
        }
    }
}