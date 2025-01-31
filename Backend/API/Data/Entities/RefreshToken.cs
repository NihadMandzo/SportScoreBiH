using System;

namespace API.Data.Entities;

public class RefreshToken
{
        public int Id { get; set; } // Primarni ključ
        public string Token { get; set; } // Generisani refresh token
        public int UserId { get; set; }
        public DateTime ExpirationDate { get; set; } // Vreme isteka
        public bool IsRevoked { get; set; } = false; // Da li je token opozvan

}
