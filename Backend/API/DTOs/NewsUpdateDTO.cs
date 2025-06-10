using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class NewsUpdateDto
{
    public string Title { get; set; }
    public string Content { get; set; }
    public List<int>? ClubIds { get; set; }
    public List<IFormFile>? NewPictures { get; set; } 
    public List<string>? PicturesToDelete { get; set; } 
    public bool DeleteAllPictures { get; set; } = false;
}
