using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;

namespace ParkingAPI.Repositories;

public class ParkingSlotsRepository : IParkingSlotsRepository
{
    private readonly ParkingLotDbContext _context;

    public ParkingSlotsRepository(ParkingLotDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ParkingSlotsDTO>> GetAllParkingSlotsAsync()
    {
        var slots = await _context.ParkingSlots.ToListAsync();
        return slots.Select(s => new ParkingSlotsDTO
        {
            Id = s.Id,
            SlotNumber = s.SlotNumber,
            IsAvailable = s.IsAvailable,
            ParkingLotId = s.ParkingLotId
        });
    }

    public async Task<ParkingSlotsDTO> GetParkingSlotByIdAsync(int id)
    {
        var slot = await _context.ParkingSlots.FindAsync(id);
        if (slot == null)
            return null!;

        return new ParkingSlotsDTO
        {
            Id = slot.Id,
            SlotNumber = slot.SlotNumber,
            IsAvailable = slot.IsAvailable,
            ParkingLotId = slot.ParkingLotId
        };
    }

    public async Task<bool> CreateParkingSlotAsync(ParkingSlot parkingSlot)
    {
        _context.ParkingSlots.Add(parkingSlot);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateParkingSlotAsync(int id, ParkingSlotsDTO parkingSlotDTO)
    {
        var slot = await _context.ParkingSlots.FindAsync(id);
        if (slot == null)
            return false;

        slot.SlotNumber = parkingSlotDTO.SlotNumber;
        slot.IsAvailable = parkingSlotDTO.IsAvailable;
        slot.ParkingLotId = parkingSlotDTO.ParkingLotId;

        _context.ParkingSlots.Update(slot);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteParkingSlotAsync(int id)
    {
        var slot = await _context.ParkingSlots.FindAsync(id);
        if (slot == null)
            return false;

        _context.ParkingSlots.Remove(slot);
        return await _context.SaveChangesAsync() > 0;
    }
}
