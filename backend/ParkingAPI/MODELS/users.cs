namespace ParkingLot.Models
{
    public class User
    {
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? Name { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
