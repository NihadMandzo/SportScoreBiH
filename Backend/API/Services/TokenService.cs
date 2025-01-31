using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Data.Entities;
using API.Entities;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserName),
                 new Claim("role", user.Role),
                new Claim("Username", user.UserName),
                new Claim("UserId", user.ID.ToString()),
                new Claim("ClubId", user.ClubID.ToString())
            };

        if (user.Role == "Admin")
        {
            claims.Add(new Claim("FirstName", ((Admin)user).FirstName));
            claims.Add(new Claim("LastName", ((Admin)user).LastName));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:AccessTokenExpirationMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
