
using API.Data.Entities;
using API.DTOs;
using API.Entities;
using System;
using System.Collections.Generic;

public class PlayerDto
{
    public int ID { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime BirthDate { get; set; }
    public int ClubId { get; set; }
    public ClubDTO Club { get; set; }

    public string Position { get; set; } = string.Empty;
    public Picture? Picture { get; set; }
    public int? PictureID { get; set; }
    public string ImageUrl { get; set; }
}

// DTO for creating/updating player data
public class PlayerCreateDto
{ 
    public string FirstName { get; set; }=string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public int ClubId { get; set; }
    public string Position { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }

}

