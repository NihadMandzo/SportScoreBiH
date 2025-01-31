using System;
using System.ComponentModel.DataAnnotations;
using API.Data.Entities;
using API.Entities;

namespace API.DTOs;

public class NewsDTO
{
    public int ID { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime DateTime { get; set; }
    public AdminDTO Admin { get; set; }
    public List<ClubDTO>? Clubs { get; set; }
    public IEnumerable<string> Pictures { get; set; }
}
