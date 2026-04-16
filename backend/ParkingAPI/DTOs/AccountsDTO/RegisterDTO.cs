using System.ComponentModel.DataAnnotations;

namespace productAPI.DTOs;

public class RegisterDTO
{
    [Required]
    [MinLength(4, ErrorMessage = "Username must be at least 4 characters long.")]
    [MaxLength(20, ErrorMessage = "Username cannot be longer than 20 characters.")]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
    [MaxLength(50, ErrorMessage = "Password cannot be longer than 50 characters.")]
    public string Password { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Name { get; set; }
}