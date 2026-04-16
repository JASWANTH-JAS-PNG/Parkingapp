using Microsoft.AspNetCore.Mvc;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;

namespace ParkingAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ParkingSlotsController : ControllerBase
{
    private readonly IParkingSlotsRepository _parkingSlotsRepository;

    public ParkingSlotsController(IParkingSlotsRepository parkingSlotsRepository)
    {
        _parkingSlotsRepository = parkingSlotsRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllParkingSlots()
    {
        var parkingSlots = await _parkingSlotsRepository.GetAllParkingSlotsAsync();
        return Ok(parkingSlots);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetParkingSlotById(int id)
    {
        var parkingSlot = await _parkingSlotsRepository.GetParkingSlotByIdAsync(id);
        if (parkingSlot == null)
        {
            return NotFound();
        }
        return Ok(parkingSlot);
    }

    [HttpPost]
    public async Task<IActionResult> CreateParkingSlot([FromBody] CreateParkingSlotDTO createParkingSlotDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var parkingSlot = new ParkingSlot
        {
            SlotNumber = createParkingSlotDTO.SlotNumber,
            IsAvailable = createParkingSlotDTO.IsAvailable,
            ParkingLotId = createParkingSlotDTO.ParkingLotId
        };

        var success = await _parkingSlotsRepository.CreateParkingSlotAsync(parkingSlot);
        if (!success)
        {
            return BadRequest("Failed to create parking slot");
        }

        return CreatedAtAction(nameof(GetParkingSlotById), new { id = parkingSlot.Id }, parkingSlot);
    }
}
