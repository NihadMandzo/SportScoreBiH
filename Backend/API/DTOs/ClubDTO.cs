using System;

namespace API.DTOs;

public class ClubDTO
{
    public int ID { get; set; }
    public string Name { get; set; }=string.Empty;
    public string Info { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; }= string.Empty;
    public string Facebook { get; set; } = string.Empty;
    public string Instagram { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public StadiumDTO Stadium { get; set; } 
}
