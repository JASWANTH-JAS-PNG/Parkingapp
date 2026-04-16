using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
using productAPI.DTOs;
using ParkingAPI.Interfaces;
using BCrypt.Net;

namespace ParkingAPI.Repositories;

public class UsersRepository : IUsersRepository
{
    private readonly ParkingLotDbContext _context;

    public UsersRepository(ParkingLotDbContext context)
    {
        _context = context;
    }

    public async Task<bool> RegisterAsync(RegisterDTO registerDTO)
    {
        if (await _context.Users.AnyAsync(u => u.UserName == registerDTO.UserName))
            return false;

        var user = new User
        {
            UserName = registerDTO.UserName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDTO.Password),
            Email = registerDTO.Email,
            Name = registerDTO.Name
        };

        _context.Users.Add(user);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<string> LoginAsync(LoginDTO loginDTO)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == loginDTO.UserName);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
            return null!;

        return user.Id.ToString();
    }

    public async Task<IEnumerable<AccountDTO>> GetAllUsersAsync()
    {
        var users = await _context.Users.ToListAsync();
        return users.Select(u => new AccountDTO
        {
            Id = u.Id,
            UserName = u.UserName,
            Email = u.Email,
            Name = u.Name
        });
    }

    public async Task<AccountDTO> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return null!;

        return new AccountDTO
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Name = user.Name
        };
    }

    public async Task<bool> UpdateUserAsync(int id, AccountDTO accountDTO)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        user.UserName = accountDTO.UserName;
        user.Email = accountDTO.Email;
        user.Name = accountDTO.Name;

        _context.Users.Update(user);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return false;

        _context.Users.Remove(user);
        return await _context.SaveChangesAsync() > 0;
    }
}
