using System.ComponentModel.DataAnnotations;

namespace productAPI.DTOs;

public class ParkingSlotsDTO
{
    public int Id { get; set; }

    [Required]
    public string SlotNumber { get; set; } = string.Empty;

    [Required]
    public bool IsAvailable { get; set; }

    [Required]
    public int ParkingLotId { get; set; }
}
