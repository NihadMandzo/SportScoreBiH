using System;
using API.Entities;

namespace API.DTOs;

public class CommentDTO
{
    public int Id { get; set; }
    public string Comment { get; set; }
    public DateTime DateTime { get; set; }
    public string Username { get; set; }
    public int NewsID { get; set; }
    public int Like { get; set; }
    public int Dislike { get; set; }
    public string? UserReaction { get; set; } 
}
