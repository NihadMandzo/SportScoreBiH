using API.Data;
using API.Data.Entities;
using API.DTOs;
using API.Entities;
using API.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace API.Controllers.AuthController
{
    [ApiController]
    [Route("api")]
    public class AuthController : Controller
    {
        public readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly EmailService _emailService;
        private readonly SMS_Service _smsService;
        public AuthController(AppDbContext context, TokenService tokenService, EmailService emailService, SMS_Service smsService)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService;
            _smsService = smsService;
        }


        

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserDTO dto)
        {
            if (await _context.User.AnyAsync(u => u.UserName == dto.Username || u.eMail == dto.Email ))
            {
                return BadRequest("Username or email already exists.");
            }

            using var hmac = new HMACSHA512();

            var user = new User
            {
                UserName = dto.Username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key,
                eMail = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                ClubID = dto.ClubId,
                IsEmailConfirmed=false,
                EmailConfirmationToken = Guid.NewGuid().ToString(),
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            // Generate email confirmation token
            user.EmailConfirmationToken = Guid.NewGuid().ToString();
            await _context.SaveChangesAsync();

            // Send email confirmation
            var confirmationLink = $"http://localhost:4200/confirm-email?token={user.EmailConfirmationToken}";
            var emailBody = $"Please confirm your email by clicking on the following link: {confirmationLink}";

            await _emailService.SendEmailAsync(user.eMail, "Email Confirmation", emailBody);

            _smsService.SendSms(user.PhoneNumber, "Hvala što koristite našu aplikaciju!");

            return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is missing."); // Dodaj provjeru za prazan token
            }
            var user = await _context.User.FirstOrDefaultAsync(u => u.EmailConfirmationToken == token);

            if (user == null)
            {
                return BadRequest("Invalid token.");
            }

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null; // Clear the token
            await _context.SaveChangesAsync();

            return Ok(new { message = "Email confirmed successfully!" });
        }

        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                await _emailService.SendEmailAsync("primatelj@gmail.com", "Test poruka", "Ovo je testna poruka.");
                return Ok("E-mail poslan uspješno!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Greška prilikom slanja e-maila: {ex.Message}");
            }
        }

        [HttpPost("reset-password-request")]
        public async Task<IActionResult> ResetPasswordRequest([FromBody] ResetPasswordRequest_DTO request)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.eMail == request.Email);
            if (user == null)
            {
                return BadRequest("Korisnik sa ovom email adresom ne postoji.");
            }

            user.PasswordResetToken = Guid.NewGuid().ToString();
            user.PasswordResetTokenExpiration = DateTime.UtcNow.AddHours(1);
            await _context.SaveChangesAsync();

            var resetLink = $"http://localhost:4200/reset-password?token={user.PasswordResetToken}";
            Console.WriteLine($"Generirani reset link: {resetLink}");
            var emailBody = $"Za resetovanje lozinke kliknite na sljedeći link: {resetLink}";

            await _emailService.SendEmailAsync(user.eMail, "Zahtjev za resetovanje lozinke", emailBody);

            return Ok("Instrukcije za resetovanje lozinke poslane su na vaš email.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ConfirmResetPasswordRequest_DTO request)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token);

            if (user == null || user.PasswordResetTokenExpiration == null || user.PasswordResetTokenExpiration < DateTime.UtcNow)
            {
                return BadRequest("Token je nevažeći ili je istekao.");
            }

            using var hmac = new HMACSHA512();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.NewPassword));
            user.PasswordSalt = hmac.Key;

            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiration = null;

            await _context.SaveChangesAsync();

            return Ok("Lozinka je uspješno resetovana.");
        }



        public class RefreshTokenDTO
        {
            public string Token { get; set; }
        }


        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDTO refreshTokenDto)
        {
            Console.WriteLine("Refresh token endpoint hit.");
            Console.WriteLine($"Received token: {refreshTokenDto.Token}");
            var refreshToken = refreshTokenDto.Token;

            Console.WriteLine($"Incoming refresh token: {refreshToken}");


            var tokenEntity = await _context.RefreshToken
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked);

            if (tokenEntity == null)
            {
                Console.WriteLine("Refresh token not found or already revoked.");
                return Unauthorized("Invalid or expired refresh token.");
            }


            if (tokenEntity.ExpirationDate < DateTime.UtcNow)
            {
                Console.WriteLine("Refresh token is expired.");
                return Unauthorized("Invalid or expired refresh token.");
            }


            var user = await _context.User.FindAsync(tokenEntity.UserId);
            if (user == null)
            {
                Console.WriteLine("User not found for the refresh token.");
                return Unauthorized("User not found.");
            }

            Console.WriteLine($"User found: {user.UserName}");


            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            Console.WriteLine($"Generated new access token: {newAccessToken}");
            Console.WriteLine($"Generated new refresh token: {newRefreshToken}");

            tokenEntity.IsRevoked = true;


            var newRefreshTokenEntity = new RefreshToken
            {
                Token = newRefreshToken,
                UserId = user.ID,
                ExpirationDate = DateTime.UtcNow.AddMinutes(15)
            };

            _context.RefreshToken.Add(newRefreshTokenEntity);


            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine("New refresh token saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving refresh token: {ex.Message}");
                return StatusCode(500, "Internal server error. Please try again.");
            }


            var response = new TokenDTO
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                UserId = user.ID,
                Role = user.Role
            };

            Console.WriteLine("Returning new tokens to client.");
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.eMail == loginDto.Email);

            if (user == null)
            {
                return Unauthorized("Invalid username or email.");
            }

            if (user.IsEmailConfirmed != true)
            {
               return Unauthorized("Molimo da potvrdite vaš email!!");
            }

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i])
                {
                    return Unauthorized("Invalid password.");
                }
            }

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.ID,
                ExpirationDate = DateTime.UtcNow.AddMinutes(100)
            };

            _context.RefreshToken.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            var response = new TokenDTO
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                UserId = user.ID,
                Role = user.Role,
                clubId = user.ClubID
            };

            return Ok(response);
        }
        [HttpGet("user-profile")]
        public async Task<IActionResult> GetUserProfile([FromQuery] int userId)
        {
            var user = await _context.User.FindAsync(userId);

            if (user == null)
            {
                return NotFound("Korisnik nije pronađen.");
            }

            return Ok(new
            {
                user.ID,
                user.UserName,
                user.eMail,
                user.PhoneNumber
            });
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDTO dto)
        {
            var user = await _context.User.FindAsync(dto.Id);

            if (user == null)
            {
                return NotFound("Korisnik nije pronađen.");
            }
            if (user.UserName != null)
            {
                user.UserName = dto.Username;
            }
            if (user.eMail != null)
            {
                user.eMail = dto.Email;
            }
            if (user.PhoneNumber != null)
            {
                user.PhoneNumber = dto.PhoneNumber;
            }

            user.UserName = dto.Username ?? user.UserName;
            user.eMail = dto.Email ?? user.eMail;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;

            // Dodaj provjeru ako korisnik pokušava promijeniti email
            if (dto.Email != null && user.eMail != dto.Email)
            {
                user.IsEmailConfirmed = false;
                user.EmailConfirmationToken = Guid.NewGuid().ToString();
                var confirmationLink = $"http://localhost:4200/confirm-email?token={user.EmailConfirmationToken}";
                var emailBody = $"Kliknite na sljedeći link da potvrdite vašu novu email adresu: {confirmationLink}";

                await _emailService.SendEmailAsync(user.eMail, "Potvrda nove email adrese", emailBody);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profil uspješno ažuriran." });
        }

        [HttpDelete("delete-profile/{userId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProfile(int userId)
        {
            var user = await _context.User.FindAsync(userId);

            if (user == null)
            {
                return NotFound("Korisnik nije pronađen.");
            }

            _context.User.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profil je uspješno obrisan." });
        }
        

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(string refreshToken)
        {
            // Check if the provided refresh token exists in the database
            var tokenEntity = await _context.RefreshToken.FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenEntity != null)
            {
                // Revoke the refresh token to prevent further use
                tokenEntity.IsRevoked = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Logout successful" });
        }
    }
}