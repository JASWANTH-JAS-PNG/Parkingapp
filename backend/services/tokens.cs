using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using productAPI.Models;
using productAPI.Interfaces;

namespace productAPI.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private  readonly SymmetricSecurityKey _key;
    public TokenService(IConfiguration configuration)

    {
        _configuration = configuration;
       _key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured")));
    }
    public string createToken(Appuser user)
    {
          var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.NameId, user.Id),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty)

        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);   
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(7),
            SigningCredentials = creds,
            Issuer = _configuration["JWT:Issuer"],
            Audience = _configuration["JWT:Audience"]
        };
           var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}