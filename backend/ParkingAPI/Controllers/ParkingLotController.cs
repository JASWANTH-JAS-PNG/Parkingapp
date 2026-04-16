using Microsoft.AspNetCore.Mvc;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;
using ParkingAPI.Helpers;
namespace ParkingAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ParkingLotController : ControllerBase
{
    private readonly IParkingLotRepository _parkingLotRepository;

    public ParkingLotController(IParkingLotRepository parkingLotRepository)
    {
        _parkingLotRepository = parkingLotRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllParkingLots([FromQuery] QueryObject query)
    {
        var parkingLots = await _parkingLotRepository.GetAllParkingLotsAsync(query);
        return Ok(parkingLots);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetParkingLotById(int id)
    {
        var parkingLot = await _parkingLotRepository.GetParkingLotByIdAsync(id);
        if (parkingLot == null)
        {
            return NotFound();
        }
        return Ok(parkingLot);
    }

    [HttpPost]
    public async Task<IActionResult> CreateParkingLot([FromBody] ParkingLotDTO parkingLotDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _parkingLotRepository.CreateParkingLotAsync(parkingLotDTO);
        if (!success)
        {
            return BadRequest("Failed to create parking lot");
        }

        return CreatedAtAction(nameof(GetParkingLotById), new { id = parkingLotDTO.Id }, parkingLotDTO);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateParkingLot(int id, [FromBody] ParkingLotDTO parkingLotDTO)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _parkingLotRepository.UpdateParkingLotAsync(id, parkingLotDTO);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteParkingLot(int id)
    {
        var result = await _parkingLotRepository.DeleteParkingLotAsync(id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}