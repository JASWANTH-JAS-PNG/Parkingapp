using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
    namespace productAPI.Repositories;

public class ParkingLotRepository : IParkingLotRepository
{
    

    private readonly ApplicationDbContext _context;
    public ParkingLotRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ParkingLot>> GetAllParkingLotsAsync(QueryObject query)
    {
        var parkingLots = _context.ParkingLots.Include(pl => pl.ParkingSlots).AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.SortBy))
        {
            if (query.SortBy.Equals("Name", StringComparison.OrdinalIgnoreCase))
                parkingLots = query.IsDescending ? parkingLots.OrderByDescending(x => x.Name) : parkingLots.OrderBy(x => x.Name);
            else if (query.SortBy.Equals("Location", StringComparison.OrdinalIgnoreCase))
                parkingLots = query.IsDescending ? parkingLots.OrderByDescending(x => x.Location) : parkingLots.OrderBy(x => x.Location);
        }

        var skip = (query.PageNumber - 1) * query.PageSize;
        return await parkingLots.Skip(skip).Take(query.PageSize).ToListAsync();
    }

    public async Task<ParkingLot> GetParkingLotByIdAsync(int id)
    {
        return await _context.ParkingLots.Include(pl => pl.ParkingSlots).FirstOrDefaultAsync(pl => pl.Id == id);
    }

    public async Task<bool> CreateParkingLotAsync(ParkingLot parkingLot)
    {
        _context.ParkingLots.Add(parkingLot);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<IActionResult> UpdateParkingLotAsync(int id, ParkingLot parkingLot)
    {
        var existingParkingLot = await _context.ParkingLots.FindAsync(id);
        if (existingParkingLot == null)
        {
            return new NotFoundResult();
        }

        existingParkingLot.Name = parkingLot.Name;
        existingParkingLot.Location = parkingLot.Location;
        existingParkingLot.TotalSlots = parkingLot.TotalSlots;

        _context.ParkingLots.Update(existingParkingLot);
        await _context.SaveChangesAsync();
        return new NoContentResult();
    }
}