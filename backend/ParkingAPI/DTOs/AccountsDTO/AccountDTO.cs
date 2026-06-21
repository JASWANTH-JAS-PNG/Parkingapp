namespace productAPI.DTOs;

public class AccountDTO
{
    public int Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Name { get; set; }
}