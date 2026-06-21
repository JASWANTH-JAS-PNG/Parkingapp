using Microsoft.AspNetCore.Mvc;
using productAPI.DTOs;
using ParkingAPI.Interfaces;

namespace BookingsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingsRepository _repository;

        public BookingsController(IBookingsRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _repository.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _repository.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }
            return Ok(booking);
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingsDTO bookingDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _repository.CreateBookingAsync(bookingDTO);
            if (!result)
            {
                return StatusCode(500, "Failed to create booking.");
            }
            return Ok(bookingDTO);
        }
    }
}
