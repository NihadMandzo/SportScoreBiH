namespace API.DTOs
{
    public class RegisterUserDTO
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int? ClubId { get; set; }
        //public ClubDTO? Club { get; set; }
        public string? PhoneNumber{ get; set; }
        public bool IsEmailConfirmed { get; set; } = false;
        public string? EmailConfirmationToken { get; set; } // Token za potvrdu emaila
    }
}
