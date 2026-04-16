using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ParkingLot.Data
{
    public class ParkingLotDbContextFactory : IDesignTimeDbContextFactory<ParkingLotDbContext>
    {
        public ParkingLotDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ParkingLotDbContext>();
            optionsBuilder.UseSqlServer("Server=.;Database=ParkingLotDB;Trusted_Connection=true;TrustServerCertificate=true;");

            return new ParkingLotDbContext(optionsBuilder.Options);
        }
    }
}
