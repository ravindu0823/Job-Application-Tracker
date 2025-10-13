using JobApplicationTrackerApi.DTO.Statistics;
using JobApplicationTrackerApi.Enum;
using JobApplicationTrackerApi.Persistence.DefaultContext;
using JobApplicationTrackerApi.Services.CacheService;
using Microsoft.EntityFrameworkCore;

namespace JobApplicationTrackerApi.Services.StatisticsService;

/// <summary>
/// Service for handling application statistics and analytics
/// </summary>
public class StatisticsService(
    DefaultContext context,
    ICacheService cacheService,
    ILogger<StatisticsService> logger
) : IStatisticsService
{
    private readonly DefaultContext _context = context ?? throw new ArgumentNullException(nameof(context));
    private readonly ICacheService _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
    private readonly ILogger<StatisticsService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <inheritdoc />
    public async Task<OverviewStatisticsDto> GetOverviewStatisticsAsync(string userId)
    {
        try
        {
            var cacheKey = $"statistics_overview_{userId}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var now = DateTime.UtcNow;
                var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
                var startOfMonth = new DateTime(now.Year, now.Month, 1);

                var applications = await _context.Applications
                    .Where(a => a.UserId == userId && a.Status == CommonStatus.Active)
                    .Select(a => new
                    {
                        a.ApplicationStatus,
                        a.ApplicationDate,
                        a.ResponseDate,
                        a.OfferDate,
                        a.Id
                    })
                    .ToListAsync();

                var totalApplications = applications.Count;

                var statusCounts = applications
                    .GroupBy(a => a.ApplicationStatus)
                    .ToDictionary(g => g.Key, g => g.Count());

                var appliedCount = statusCounts.GetValueOrDefault(ApplicationStatus.Applied, 0);
                var interviewCount = statusCounts.GetValueOrDefault(ApplicationStatus.Interview, 0);
                var offerCount = statusCounts.GetValueOrDefault(ApplicationStatus.Offer, 0);
                var rejectedCount = statusCounts.GetValueOrDefault(ApplicationStatus.Rejected, 0);

                // Calculate rates
                var responseRate = totalApplications > 0
                    ? (applications.Count(a => a.ResponseDate.HasValue) / (double)totalApplications) * 100
                    : 0;

                var successRate = totalApplications > 0
                    ? (offerCount / (double)totalApplications) * 100
                    : 0;

                var interviewRate = totalApplications > 0
                    ? (interviewCount / (double)totalApplications) * 100
                    : 0;

                // Calculate average days
                var applicationsWithResponse = applications.Where(a => a.ResponseDate.HasValue).ToList();
                var averageDaysToResponse = applicationsWithResponse.Any()
                    ? applicationsWithResponse.Average(a => (a.ResponseDate!.Value - a.ApplicationDate).TotalDays)
                    : (double?)null;

                // Get applications with interviews
                var applicationIds = applications.Select(a => a.Id).ToList();
                var interviewData = await _context.Interviews
                    .Where(i => applicationIds.Contains(i.ApplicationId) && i.Status == CommonStatus.Active)
                    .GroupBy(i => i.ApplicationId)
                    .Select(g => new
                    {
                        ApplicationId = g.Key,
                        FirstInterviewDate = g.Min(i => i.InterviewDate)
                    })
                    .ToListAsync();

                var applicationsWithInterviews = applications
                    .Join(interviewData, a => a.Id, i => i.ApplicationId, (a, i) => new
                    {
                        a.ApplicationDate,
                        i.FirstInterviewDate
                    })
                    .ToList();

                var averageDaysToInterview = applicationsWithInterviews.Any()
                    ? applicationsWithInterviews.Average(a => (a.FirstInterviewDate - a.ApplicationDate).TotalDays)
                    : (double?)null;

                var applicationsWithOffer = applications.Where(a => a.OfferDate.HasValue).ToList();
                var averageDaysToOffer = applicationsWithOffer.Any()
                    ? applicationsWithOffer.Average(a => (a.OfferDate!.Value - a.ApplicationDate).TotalDays)
                    : (double?)null;

                // Count applications this week and month
                var applicationsThisWeek = applications.Count(a => a.ApplicationDate >= startOfWeek);
                var applicationsThisMonth = applications.Count(a => a.ApplicationDate >= startOfMonth);

                // Count upcoming interviews
                var upcomingInterviews = await _context.Interviews
                    .Where(i => applicationIds.Contains(i.ApplicationId) && 
                               i.Status == CommonStatus.Active &&
                               i.InterviewDate >= now)
                    .CountAsync();

                return new OverviewStatisticsDto
                {
                    TotalApplications = totalApplications,
                    AppliedCount = appliedCount,
                    InterviewCount = interviewCount,
                    OfferCount = offerCount,
                    RejectedCount = rejectedCount,
                    ResponseRate = Math.Round(responseRate, 2),
                    SuccessRate = Math.Round(successRate, 2),
                    InterviewRate = Math.Round(interviewRate, 2),
                    AverageDaysToResponse = averageDaysToResponse.HasValue 
                        ? Math.Round(averageDaysToResponse.Value, 2) 
                        : null,
                    AverageDaysToInterview = averageDaysToInterview.HasValue 
                        ? Math.Round(averageDaysToInterview.Value, 2) 
                        : null,
                    AverageDaysToOffer = averageDaysToOffer.HasValue 
                        ? Math.Round(averageDaysToOffer.Value, 2) 
                        : null,
                    ApplicationsThisWeek = applicationsThisWeek,
                    ApplicationsThisMonth = applicationsThisMonth,
                    UpcomingInterviews = upcomingInterviews
                };
            }, TimeSpan.FromMinutes(10)) ?? new OverviewStatisticsDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving overview statistics for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<StatusDistributionDto>> GetStatusDistributionAsync(string userId)
    {
        try
        {
            var cacheKey = $"statistics_status_distribution_{userId}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var statusCounts = await _context.Applications
                    .Where(a => a.UserId == userId && a.Status == CommonStatus.Active)
                    .GroupBy(a => a.ApplicationStatus)
                    .Select(g => new
                    {
                        Status = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                var totalApplications = statusCounts.Sum(s => s.Count);

                var distribution = statusCounts.Select(s => new StatusDistributionDto
                {
                    Status = s.Status,
                    StatusName = s.Status.ToString(),
                    Count = s.Count,
                    Percentage = totalApplications > 0 
                        ? Math.Round((s.Count / (double)totalApplications) * 100, 2) 
                        : 0
                }).OrderBy(s => s.Status).ToList();

                return distribution;
            }, TimeSpan.FromMinutes(10)) ?? new List<StatusDistributionDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving status distribution for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<TimelineDataDto> GetTimelineDataAsync(string userId, DateTime? startDate = null, DateTime? endDate = null)
    {
        try
        {
            var effectiveStartDate = startDate ?? DateTime.UtcNow.AddMonths(-12);
            var effectiveEndDate = endDate ?? DateTime.UtcNow;

            var cacheKey = $"statistics_timeline_{userId}_{effectiveStartDate:yyyyMMdd}_{effectiveEndDate:yyyyMMdd}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var applications = await _context.Applications
                    .Where(a => a.UserId == userId && 
                               a.Status == CommonStatus.Active &&
                               a.ApplicationDate >= effectiveStartDate &&
                               a.ApplicationDate <= effectiveEndDate)
                    .Select(a => new
                    {
                        a.Id,
                        a.ApplicationDate,
                        a.OfferDate,
                        a.ApplicationStatus
                    })
                    .ToListAsync();

                var applicationIds = applications.Select(a => a.Id).ToList();

                var interviews = await _context.Interviews
                    .Where(i => applicationIds.Contains(i.ApplicationId) && 
                               i.Status == CommonStatus.Active)
                    .Select(i => new
                    {
                        i.InterviewDate
                    })
                    .ToListAsync();

                // Group applications by date
                var applicationsByDate = applications
                    .GroupBy(a => a.ApplicationDate.Date)
                    .ToDictionary(g => g.Key, g => g.Count());

                var interviewsByDate = interviews
                    .GroupBy(i => i.InterviewDate.Date)
                    .ToDictionary(g => g.Key, g => g.Count());

                var offersByDate = applications
                    .Where(a => a.OfferDate.HasValue)
                    .GroupBy(a => a.OfferDate!.Value.Date)
                    .ToDictionary(g => g.Key, g => g.Count());

                var rejectionsByDate = applications
                    .Where(a => a.ApplicationStatus == ApplicationStatus.Rejected)
                    .GroupBy(a => a.ApplicationDate.Date)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Generate data points for each day in the range
                var dataPoints = new List<TimelineDataPointDto>();
                var currentDate = effectiveStartDate.Date;
                var cumulativeApplications = 0;

                while (currentDate <= effectiveEndDate.Date)
                {
                    var applicationsOnDate = applicationsByDate.GetValueOrDefault(currentDate, 0);
                    cumulativeApplications += applicationsOnDate;

                    dataPoints.Add(new TimelineDataPointDto
                    {
                        Date = currentDate,
                        ApplicationsSubmitted = applicationsOnDate,
                        InterviewsScheduled = interviewsByDate.GetValueOrDefault(currentDate, 0),
                        OffersReceived = offersByDate.GetValueOrDefault(currentDate, 0),
                        RejectionsReceived = rejectionsByDate.GetValueOrDefault(currentDate, 0),
                        CumulativeApplications = cumulativeApplications
                    });

                    currentDate = currentDate.AddDays(1);
                }

                return new TimelineDataDto
                {
                    StartDate = effectiveStartDate,
                    EndDate = effectiveEndDate,
                    DataPoints = dataPoints
                };
            }, TimeSpan.FromMinutes(15)) ?? new TimelineDataDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving timeline data for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ResponseRateDto> GetResponseRateAsync(string userId)
    {
        try
        {
            var cacheKey = $"statistics_response_rate_{userId}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var applications = await _context.Applications
                    .Where(a => a.UserId == userId && a.Status == CommonStatus.Active)
                    .Select(a => new
                    {
                        a.Id,
                        a.ApplicationDate,
                        a.ResponseDate,
                        a.ApplicationStatus
                    })
                    .ToListAsync();

                var totalApplications = applications.Count;
                var applicationsWithResponse = applications.Where(a => a.ResponseDate.HasValue).ToList();
                var applicationsWithResponseCount = applicationsWithResponse.Count;
                var applicationsWithoutResponse = totalApplications - applicationsWithResponseCount;

                var applicationIds = applications.Select(a => a.Id).ToList();

                var applicationsWithInterview = await _context.Interviews
                    .Where(i => applicationIds.Contains(i.ApplicationId) && i.Status == CommonStatus.Active)
                    .Select(i => i.ApplicationId)
                    .Distinct()
                    .CountAsync();

                var applicationsWithOffer = applications.Count(a => a.ApplicationStatus == ApplicationStatus.Offer);

                var responseRatePercentage = totalApplications > 0
                    ? (applicationsWithResponseCount / (double)totalApplications) * 100
                    : 0;

                var interviewRatePercentage = totalApplications > 0
                    ? (applicationsWithInterview / (double)totalApplications) * 100
                    : 0;

                var offerRatePercentage = totalApplications > 0
                    ? (applicationsWithOffer / (double)totalApplications) * 100
                    : 0;

                // Calculate response time statistics
                var responseTimes = applicationsWithResponse
                    .Select(a => (int)(a.ResponseDate!.Value - a.ApplicationDate).TotalDays)
                    .OrderBy(d => d)
                    .ToList();

                var averageDaysToResponse = responseTimes.Any()
                    ? Math.Round(responseTimes.Average(), 2)
                    : (double?)null;

                var medianDaysToResponse = responseTimes.Any()
                    ? GetMedian(responseTimes)
                    : (double?)null;

                var fastestResponseDays = responseTimes.Any() ? responseTimes.First() : (int?)null;
                var slowestResponseDays = responseTimes.Any() ? responseTimes.Last() : (int?)null;

                return new ResponseRateDto
                {
                    TotalApplications = totalApplications,
                    ApplicationsWithResponse = applicationsWithResponseCount,
                    ApplicationsWithoutResponse = applicationsWithoutResponse,
                    ResponseRatePercentage = Math.Round(responseRatePercentage, 2),
                    ApplicationsWithInterview = applicationsWithInterview,
                    InterviewRatePercentage = Math.Round(interviewRatePercentage, 2),
                    ApplicationsWithOffer = applicationsWithOffer,
                    OfferRatePercentage = Math.Round(offerRatePercentage, 2),
                    AverageDaysToResponse = averageDaysToResponse,
                    MedianDaysToResponse = medianDaysToResponse,
                    FastestResponseDays = fastestResponseDays,
                    SlowestResponseDays = slowestResponseDays
                };
            }, TimeSpan.FromMinutes(10)) ?? new ResponseRateDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving response rate for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<SalaryInsightsDto> GetSalaryInsightsAsync(string userId)
    {
        try
        {
            var cacheKey = $"statistics_salary_insights_{userId}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var applications = await _context.Applications
                    .Where(a => a.UserId == userId && 
                               a.Status == CommonStatus.Active &&
                               a.Salary.HasValue)
                    .Select(a => new
                    {
                        a.Salary,
                        a.ApplicationStatus
                    })
                    .ToListAsync();

                var salaries = applications.Select(a => a.Salary!.Value).OrderBy(s => s).ToList();

                var averageSalary = salaries.Any() ? Math.Round(salaries.Average(), 2) : (decimal?)null;
                var medianSalary = salaries.Any() ? GetMedian(salaries) : (decimal?)null;
                var minSalary = salaries.Any() ? salaries.Min() : (decimal?)null;
                var maxSalary = salaries.Any() ? salaries.Max() : (decimal?)null;

                var offerSalaries = applications
                    .Where(a => a.ApplicationStatus == ApplicationStatus.Offer)
                    .Select(a => a.Salary!.Value)
                    .ToList();

                var averageOfferSalary = offerSalaries.Any() 
                    ? Math.Round(offerSalaries.Average(), 2) 
                    : (decimal?)null;

                // Salary by status
                var salaryByStatus = applications
                    .GroupBy(a => a.ApplicationStatus)
                    .Select(g => new SalaryByStatusDto
                    {
                        Status = g.Key,
                        StatusName = g.Key.ToString(),
                        AverageSalary = Math.Round(g.Average(a => a.Salary!.Value), 2),
                        Count = g.Count()
                    })
                    .OrderBy(s => s.Status)
                    .ToList();

                // Salary range distribution
                var salaryRanges = new List<(string Label, decimal Min, decimal Max)>
                {
                    ("< $50k", 0, 50000),
                    ("$50k - $75k", 50000, 75000),
                    ("$75k - $100k", 75000, 100000),
                    ("$100k - $125k", 100000, 125000),
                    ("$125k - $150k", 125000, 150000),
                    ("$150k - $200k", 150000, 200000),
                    ("$200k+", 200000, decimal.MaxValue)
                };

                var totalSalaryApplications = salaries.Count;

                var salaryRangeDistribution = salaryRanges.Select(range =>
                {
                    var count = salaries.Count(s => s >= range.Min && s < range.Max);
                    return new SalaryRangeDistributionDto
                    {
                        RangeLabel = range.Label,
                        MinRange = range.Min,
                        MaxRange = range.Max,
                        Count = count,
                        Percentage = totalSalaryApplications > 0 
                            ? Math.Round((count / (double)totalSalaryApplications) * 100, 2) 
                            : 0
                    };
                }).Where(r => r.Count > 0).ToList();

                return new SalaryInsightsDto
                {
                    AverageSalary = averageSalary,
                    MedianSalary = medianSalary,
                    MinSalary = minSalary,
                    MaxSalary = maxSalary,
                    AverageOfferSalary = averageOfferSalary,
                    ApplicationsWithSalaryCount = totalSalaryApplications,
                    SalaryByStatus = salaryByStatus,
                    SalaryRangeDistribution = salaryRangeDistribution
                };
            }, TimeSpan.FromMinutes(10)) ?? new SalaryInsightsDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving salary insights for user {UserId}", userId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<List<TopCompanyDto>> GetTopCompaniesAsync(string userId, int topN = 10)
    {
        try
        {
            var cacheKey = $"statistics_top_companies_{userId}_{topN}";
            
            return await _cacheService.GetOrSetAsync(cacheKey, async () =>
            {
                var applications = await _context.Applications
                    .Where(a => a.UserId == userId && a.Status == CommonStatus.Active)
                    .GroupBy(a => a.CompanyName)
                    .Select(g => new
                    {
                        CompanyName = g.Key,
                        ApplicationCount = g.Count(),
                        InterviewCount = g.Count(a => a.ApplicationStatus == ApplicationStatus.Interview),
                        OfferCount = g.Count(a => a.ApplicationStatus == ApplicationStatus.Offer),
                        RejectionCount = g.Count(a => a.ApplicationStatus == ApplicationStatus.Rejected),
                        AverageSalary = g.Where(a => a.Salary.HasValue).Any()
                            ? (decimal?)Math.Round(g.Where(a => a.Salary.HasValue).Average(a => a.Salary!.Value), 2)
                            : null
                    })
                    .OrderByDescending(c => c.ApplicationCount)
                    .Take(topN)
                    .ToListAsync();

                var topCompanies = applications.Select(c => new TopCompanyDto
                {
                    CompanyName = c.CompanyName,
                    ApplicationCount = c.ApplicationCount,
                    InterviewCount = c.InterviewCount,
                    OfferCount = c.OfferCount,
                    RejectionCount = c.RejectionCount,
                    SuccessRate = c.ApplicationCount > 0 
                        ? Math.Round((c.OfferCount / (double)c.ApplicationCount) * 100, 2) 
                        : 0,
                    AverageSalary = c.AverageSalary
                }).ToList();

                return topCompanies;
            }, TimeSpan.FromMinutes(10)) ?? new List<TopCompanyDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top companies for user {UserId}", userId);
            throw;
        }
    }

    /// <summary>
    /// Helper method to calculate median
    /// </summary>
    private static double GetMedian(List<int> values)
    {
        var count = values.Count;
        if (count == 0) return 0;

        if (count % 2 == 0)
        {
            return (values[count / 2 - 1] + values[count / 2]) / 2.0;
        }
        return values[count / 2];
    }

    /// <summary>
    /// Helper method to calculate median for decimal values
    /// </summary>
    private static decimal GetMedian(List<decimal> values)
    {
        var count = values.Count;
        if (count == 0) return 0;

        if (count % 2 == 0)
        {
            return (values[count / 2 - 1] + values[count / 2]) / 2;
        }
        return values[count / 2];
    }
}

