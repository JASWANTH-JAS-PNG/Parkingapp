using ParkingLot.Models;

namespace productAPI.Services;

public interface ITokenService
{
    string createToken(User user);
}
