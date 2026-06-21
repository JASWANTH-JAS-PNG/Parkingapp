using Microsoft.EntityFrameworkCore;
using ParkingLot.Models;

namespace ParkingLot.Data
{
    public class ParkingLotDbContext : DbContext
    {
        public ParkingLotDbContext(DbContextOptions<ParkingLotDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ParkingSlot> ParkingSlots { get; set; }
        public DbSet<Models.ParkingLot> ParkingLotingTickets { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasKey(u => u.Id);
            modelBuilder.Entity<ParkingSlot>().HasKey(p => p.Id);
            modelBuilder.Entity<Models.ParkingLot>().HasKey(pl => pl.Id);
            modelBuilder.Entity<Booking>().HasKey(b => b.Id);
        }
    }
}
