using System.ComponentModel.DataAnnotations;

namespace ParkingLot.Models
{
    public class ParkingLot
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public int TotalSlots { get; set; }

        public ICollection<ParkingSlot> ParkingSlots { get; set; } = new List<ParkingSlot>();
    }
}
