using System.ComponentModel.DataAnnotations;

namespace productAPI.DTOs;

public class ParkingLotDTO
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    [Required]
    public int TotalSlots { get; set; }
}
