using System;

namespace API.DTOs;

public class TokenDTO
{
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; }
        public int? clubId { get; set; }

}
