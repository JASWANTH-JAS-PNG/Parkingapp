using productAPI.DTOs;
using ParkingLot.Models;

namespace ParkingAPI.Interfaces;

public interface IParkingSlotsRepository
{
    Task<IEnumerable<ParkingSlotsDTO>> GetAllParkingSlotsAsync();
    Task<ParkingSlotsDTO> GetParkingSlotByIdAsync(int id);
    Task<bool> CreateParkingSlotAsync(ParkingSlot parkingSlot);
    Task<bool> UpdateParkingSlotAsync(int id, ParkingSlotsDTO parkingSlotDTO);
    Task<bool> DeleteParkingSlotAsync(int id);
}