using API.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public  class User
{
    [Key]
    public int ID { get; set; }
    public required string UserName { get; set; }
    public required byte[] PasswordHash { get; set; }
    public required byte[] PasswordSalt { get; set; }
    public required string eMail { get; set; }
    public string? PhoneNumber{ get; set; }

    public int? ClubID { get; set; }
    [ForeignKey("ClubID")]
    public Club? Club { get; set; }
    public bool IsEmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; } // Token za potvrdu emaila
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiration { get; set; }

    public string Role {get; set;} = "User";
    
    //public List<Comment> Comments { get; set; }
}
