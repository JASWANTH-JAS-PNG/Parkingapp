using System.ComponentModel.DataAnnotations;

namespace ParkingLot.Models
{
    public class Booking
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public int ParkingSlotId { get; set; }
        public ParkingSlot? ParkingSlot { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }
    }
}
