using ParkingLot.Models;

namespace ParkingAPI.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}