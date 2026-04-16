using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
namespace productAPI.DTOs;
public class UpdateParkingLotDTO
{

[Required]

[MinLength(3, ErrorMessage = "ID must be at least 3 characters long.")]
[MaxLength(50, ErrorMessage = "ID cannot be longer than 50 characters.")]
public int Id { get; set; }
    
[Required]
[MinLength(3, ErrorMessage = "Name must be at least 3 characters long.")]
[MaxLength(50, ErrorMessage = "Name cannot be longer than 50 characters.")]
public string Name { get; set; } = string.Empty;
    [Required]
    [MinLength(3, ErrorMessage = "Location must be at least 3 characters long.")]
    [MaxLength(100, ErrorMessage = "Location cannot be longer than 100 characters.")]

    public string Location { get; set; } = string.Empty;
[Required]
[Range(1, int.MaxValue, ErrorMessage = "Total slots must be at least 1.")]
[MaxLength(1000, ErrorMessage = "Total slots cannot be more than 1000.")]
    public int TotalSlots { get; set; }
}