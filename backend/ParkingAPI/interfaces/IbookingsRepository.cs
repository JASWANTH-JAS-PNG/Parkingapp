using productAPI.DTOs;

namespace ParkingAPI.Interfaces;

public interface IBookingsRepository
{
    Task<IEnumerable<BookingsDTO>> GetAllBookingsAsync();
    Task<BookingsDTO> GetBookingByIdAsync(int id);
    Task<bool> CreateBookingAsync(CreateBookingsDTO bookingDTO);
    Task<bool> UpdateBookingAsync(int id, UpdateBookingsDTO bookingDTO);
    Task<bool> DeleteBookingAsync(int id);
}