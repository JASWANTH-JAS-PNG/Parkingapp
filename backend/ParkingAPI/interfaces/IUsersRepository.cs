using productAPI.DTOs;

namespace ParkingAPI.Interfaces;

public interface IUsersRepository
{
    Task<bool> RegisterAsync(RegisterDTO registerDTO);
    Task<string> LoginAsync(LoginDTO loginDTO);
    Task<IEnumerable<AccountDTO>> GetAllUsersAsync();
    Task<AccountDTO> GetUserByIdAsync(int id);
    Task<bool> UpdateUserAsync(int id, AccountDTO accountDTO);
    Task<bool> DeleteUserAsync(int id);
}