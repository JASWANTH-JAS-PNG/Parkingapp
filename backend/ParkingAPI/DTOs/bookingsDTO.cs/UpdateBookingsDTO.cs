using System.ComponentModel.DataAnnotations;

namespace productAPI.DTOs;

public class UpdateBookingsDTO
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int ParkingSlotId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}