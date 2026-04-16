using Microsoft.AspNetCore.Identity;

namespace ParkingLot.Models
{
    public class User : IdentityUser
    {
        public override string? UserName { get; set; }

        public override string? Email { get; set; }

        public string? Name { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
