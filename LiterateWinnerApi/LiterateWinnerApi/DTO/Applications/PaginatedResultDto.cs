namespace JobApplicationTrackerApi.DTO.Applications;

/// <summary>
/// Represents a generic wrapper for paginated query results.
/// It helps return data in pages instead of all at once,
/// along with metadata such as total count, current page, and navigation info.
/// </summary>
public class PaginatedResultDto<T>
{
    /// <summary>
    /// The list of items returned for the current page.
    /// Generic type <typeparamref name="T"/> allows it to work with any data model.
    /// </summary>
    public List<T> Items { get; set; } = new();
    
    /// <summary>
    /// The total number of items available across all pages (not just this page).
    /// </summary>
    public int TotalCount { get; set; }
    
    /// <summary>
    /// The current page number (1-based index).
    /// </summary>
    public int PageNumber { get; set; }
    
    /// <summary>
    /// The number of items included per page.
    /// </summary>
    public int PageSize { get; set; }
    
    /// <summary>
    /// The total number of pages, calculated based on the total item count and page size.
    /// Uses Math.Ceiling to round up partial pages.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    
    /// <summary>
    /// Indicates whether there is a previous page available.
    /// True if the current page number is greater than 1.
    /// </summary>
    public bool HasPrevious => PageNumber > 1;
    
    /// <summary>
    /// Indicates whether there is a next page available.
    /// True if the current page number is less than the total number of pages.
    /// </summary>
    public bool HasNext => PageNumber < TotalPages;
}