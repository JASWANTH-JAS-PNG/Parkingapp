
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParkingLot.Data;
using ParkingLot.Models;
using productAPI.DTOs;
using productAPI.Services;
using BCrypt.Net;

namespace productAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly ITokenService _tokenService;
    private readonly ParkingLotDbContext _context;

    public AccountController(ITokenService tokenService, ParkingLotDbContext context)
    {
        _tokenService = tokenService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
    {
        try
        {
            if (await _context.Users.AnyAsync(u => u.UserName == registerDto.UserName))
            {
                return BadRequest("Username is already taken");
            }

            var user = new User
            {
                UserName = registerDto.UserName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return Ok(new { token = _tokenService.createToken(user) });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO accountDto)
    {
        try
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == accountDto.UserName);
            if (user == null || !BCrypt.Net.BCrypt.Verify(accountDto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid username or password");
            }

            return Ok(new { token = _tokenService.createToken(user) });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
