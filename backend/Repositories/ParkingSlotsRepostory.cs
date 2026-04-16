using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace productAPI.DTOs;
public class ParkingSlotDTO : IParkingSlotsRepository
{

    private readonly IParkingSlotsRepository _parkingSlotsRepository;
    public ParkingSlotDTO(IParkingSlotsRepository parkingSlotsRepository)
    {
        _parkingSlotsRepository = parkingSlotsRepository;
    }


    public async Task<IActionResult> GetAllParkingSlotsAsync()
    {
        var parkingSlots = await _parkingSlotsRepository.GetAllParkingSlotsAsync();
        return new OkObjectResult(parkingSlots);
    }   


    public async Task<IActionResult> GetParkingSlotByIdAsync(int id)
    {
        var parkingSlot = await _parkingSlotsRepository.GetParkingSlotByIdAsync(id);
        if (parkingSlot == null)
        {
            return new NotFoundResult();
        }
        return new OkObjectResult(parkingSlot);
    }

    public async Task<IActionResult> CreateParkingSlotAsync(ParkingSlotDTO parkingSlotDTO)
    {
        var result = await _parkingSlotsRepository.CreateParkingSlotAsync(parkingSlotDTO);
        if (result)
        {
            return new OkResult();
        }
        return new BadRequestResult();
    }


    public async Task<IActionResult> UpdateParkingSlotAsync(int id, ParkingSlotDTO parkingSlotDTO)
    {
        var result = await _parkingSlotsRepository.UpdateParkingSlotAsync(id, parkingSlotDTO);
        if (result)
        {
            return new OkResult();
        }
        return new NotFoundResult();
    }


    public async Task<IActionResult> DeleteParkingSlotAsync(int id)
    {
        var result = await _parkingSlotsRepository.DeleteParkingSlotAsync(id);
        if (result)
        {
            return new OkResult();
        }
        return new NotFoundResult();
    }

    public Task<IEnumerable<ParkingSlotDTO>> GetAllParkingSlotsAsync()
    {
        throw new NotImplementedException();
    }
    
}




