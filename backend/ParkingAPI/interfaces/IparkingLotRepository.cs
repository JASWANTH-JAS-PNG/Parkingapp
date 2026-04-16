using productAPI.DTOs;
using ParkingAPI.Helpers;

namespace ParkingAPI.Interfaces;

public interface IParkingLotRepository
{
    Task<IEnumerable<ParkingLotDTO>> GetAllParkingLotsAsync(QueryObject query);
    Task<ParkingLotDTO> GetParkingLotByIdAsync(int id);
    Task<bool> CreateParkingLotAsync(ParkingLotDTO parkingLot);
    Task<bool> UpdateParkingLotAsync(int id, ParkingLotDTO parkingLotDTO);
    Task<bool> DeleteParkingLotAsync(int id);
}