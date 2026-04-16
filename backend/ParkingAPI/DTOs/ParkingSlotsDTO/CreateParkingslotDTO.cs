using System.ComponentModel.DataAnnotations;

namespace productAPI.DTOs;

public class CreateParkingSlotDTO
{
    [Required]
    [MinLength(1, ErrorMessage = "Slot number cannot be empty.")]
    [MaxLength(10, ErrorMessage = "Slot number cannot be longer than 10 characters.")]
    public int ParkingLotId { get; set; }
    

    [Required]
    [MinLength(1, ErrorMessage = "Slot number cannot be empty.")]
    [MaxLength(10, ErrorMessage = "Slot number cannot be longer than 10 characters.")]
    public string SlotNumber { get; set; } = string.Empty;

    [Required]
    [Range(0, 1, ErrorMessage = "IsAvailable must be either true (1) or false (0).")]
    
    public bool IsAvailable { get; set; }
    public bool IsOccupied { get; set; }

}