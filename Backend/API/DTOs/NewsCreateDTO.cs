using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class NewsCreateDTO
{
    [RegularExpression(@"^(?:[^a-zA-Z]*[a-zA-Z]){10,}.*$", 
    ErrorMessage = "Title must contain at least 10 letters.")]

    public string Title { get; set; }
    [RegularExpression(@"^(?:[^a-zA-Z]*[a-zA-Z]){35,}.*$", 
    ErrorMessage = "Title must contain at least 10 letters.")]

    public string Content { get; set; }
    public List<int>? ClubIds { get; set; } = new List<int>();
    [Required]
    public List<IFormFile> Pictures { get; set; } 
}
