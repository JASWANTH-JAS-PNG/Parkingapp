using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;
using ParkingAPI.Helpers;

namespace ParkingAPI.Repositories;

public class ParkingLotRepository : IParkingLotRepository
{
    private readonly ParkingLotDbContext _context;

    public ParkingLotRepository(ParkingLotDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ParkingLotDTO>> GetAllParkingLotsAsync(QueryObject query)
    {
        var parkingLots = await _context.ParkingLotingTickets.ToListAsync();
        var result = parkingLots.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(query.SortBy))
        {
            if (query.SortBy.Equals("Name", StringComparison.OrdinalIgnoreCase))
                result = query.IsDescending ? result.OrderByDescending(x => x.Name) : result.OrderBy(x => x.Name);
            else if (query.SortBy.Equals("Location", StringComparison.OrdinalIgnoreCase))
                result = query.IsDescending ? result.OrderByDescending(x => x.Location) : result.OrderBy(x => x.Location);
        }

        var skip = (query.PageNumber - 1) * query.PageSize;
        var items = result
            .Skip(skip)
            .Take(query.PageSize)
            .Select(pl => new ParkingLotDTO
            {
                Id = pl.Id,
                Name = pl.Name,
                Location = pl.Location,
                TotalSlots = pl.TotalSlots
            })
            .ToList();

        return items;
    }

    public async Task<ParkingLotDTO> GetParkingLotByIdAsync(int id)
    {
        var parkingLot = await _context.ParkingLotingTickets.FindAsync(id);
        if (parkingLot == null)
            return null!;

        return new ParkingLotDTO
        {
            Id = parkingLot.Id,
            Name = parkingLot.Name,
            Location = parkingLot.Location,
            TotalSlots = parkingLot.TotalSlots
        };
    }

    public async Task<bool> CreateParkingLotAsync(ParkingLotDTO parkingLotDTO)
    {
        var parkingLot = new ParkingLot.Models.ParkingLot
        {
            Name = parkingLotDTO.Name,
            Location = parkingLotDTO.Location,
            TotalSlots = parkingLotDTO.TotalSlots
        };

        _context.ParkingLotingTickets.Add(parkingLot);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateParkingLotAsync(int id, ParkingLotDTO parkingLotDTO)
    {
        var parkingLot = await _context.ParkingLotingTickets.FindAsync(id);
        if (parkingLot == null)
            return false;

        parkingLot.Name = parkingLotDTO.Name;
        parkingLot.Location = parkingLotDTO.Location;
        parkingLot.TotalSlots = parkingLotDTO.TotalSlots;

        _context.ParkingLotingTickets.Update(parkingLot);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteParkingLotAsync(int id)
    {
        var parkingLot = await _context.ParkingLotingTickets.FindAsync(id);
        if (parkingLot == null)
            return false;

        _context.ParkingLotingTickets.Remove(parkingLot);
        return await _context.SaveChangesAsync() > 0;
    }
}
