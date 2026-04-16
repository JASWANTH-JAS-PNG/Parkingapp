using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
namespace productAPI.DTOs;


public class BookingsDTO : IBookingsDTO
{
    

    public async Task<Booking> ToBookingAsync(ApplicationDbContext context)
    {
        var user = await context.Users.FindAsync(UserId);
        if (user == null)
        {
            throw new Exception($"User with ID {UserId} not found.");
        }

        var booking = new Booking
        {
            UserId = UserId,
            ParkingSlot = ParkingSlot,
            StartTime = StartTime,
            EndTime = EndTime
        };

        return booking;
    }
}