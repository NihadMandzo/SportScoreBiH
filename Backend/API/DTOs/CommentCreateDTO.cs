using System;

namespace API.DTOs;

public class CommentCreateDTO
{
    public string Comment { get; set; }
    public int UserID { get; set; }
}
