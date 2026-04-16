namespace productAPI.DTOs;

public class AccountDTO
{
    public string Id { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Name { get; set; }
}