using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;

namespace ParkingAPI.Repositories;

public class BookingsRepository : IBookingsRepository
{
    private readonly ParkingLotDbContext _context;

    public BookingsRepository(ParkingLotDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BookingsDTO>> GetAllBookingsAsync()
    {
        var bookings = await _context.Bookings.ToListAsync();
        return bookings.Select(b => new BookingsDTO
        {
            Id = b.Id,
            UserId = b.UserId,
            ParkingSlotId = b.ParkingSlotId,
            StartTime = b.StartTime,
            EndTime = b.EndTime
        });
    }

    public async Task<BookingsDTO> GetBookingByIdAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return null!;

        return new BookingsDTO
        {
            Id = booking.Id,
            UserId = booking.UserId,
            ParkingSlotId = booking.ParkingSlotId,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime
        };
    }

    public async Task<bool> CreateBookingAsync(CreateBookingsDTO bookingDTO)
    {
        var booking = new Booking
        {
            UserId = bookingDTO.UserId,
            ParkingSlotId = bookingDTO.ParkingSlotId,
            StartTime = bookingDTO.StartTime,
            EndTime = bookingDTO.EndTime
        };

        _context.Bookings.Add(booking);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateBookingAsync(int id, UpdateBookingsDTO bookingDTO)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return false;

        booking.UserId = bookingDTO.UserId;
        booking.ParkingSlotId = bookingDTO.ParkingSlotId;
        booking.StartTime = bookingDTO.StartTime;
        booking.EndTime = bookingDTO.EndTime;

        _context.Bookings.Update(booking);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteBookingAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return false;

        _context.Bookings.Remove(booking);
        return await _context.SaveChangesAsync() > 0;
    }
}
