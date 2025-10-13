using AutoMapper;
using JobApplicationTrackerApi.DTO.Interviews;
using JobApplicationTrackerApi.Persistence.DefaultContext.Entity;

namespace JobApplicationTrackerApi.Mappings;

/// <summary>
/// AutoMapper profile for Interview entity and DTOs
/// </summary>
public class InterviewsMappingProfile : Profile
{
    /// <summary>
    /// Initializes a new instance of the InterviewsMappingProfile class
    /// </summary>
    public InterviewsMappingProfile()
    {
        // Entity to Response DTO
        CreateMap<Interview, InterviewResponseDto>();
        // Create DTO to Entity
        CreateMap<CreateInterviewDto, Interview>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ReminderSent, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedUtc, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedUtc, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedUtc, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Application, opt => opt.Ignore());

        // Update DTO to Entity (for partial updates)
        CreateMap<UpdateInterviewDto, Interview>()
            .ForAllMembers(opt => opt.Condition((_, _, srcMember) => srcMember != null));
    }
}