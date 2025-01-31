namespace API.DTOs
{
    public class UpdateUserProfileDTO
    {
        
            public int Id { get; set; } // ID korisnika
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }
        

    }
}
