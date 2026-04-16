using System.ComponentModel.DataAnnotations;

namespace ParkingLot.Models
{
    public class ParkingSlot
    {
        public int Id { get; set; }

        [Required]
        public string SlotNumber { get; set; } = string.Empty;

        [Required]
        public bool IsAvailable { get; set; }

        [Required]
        public int ParkingLotId { get; set; }
        public ParkingLot? ParkingLot { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
