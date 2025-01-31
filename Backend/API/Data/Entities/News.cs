using API.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Entities;

public class News
{
    [Key]
    public int ID { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime  DateTime { get; set; }

    public int AdminID {get; set;} = 1;
    public Admin Admin { get; set; } 
    public List<NewsClub>? NewsClubs { get; set; } = new List<NewsClub>();

 
    public List<NewsPictures> NewsPictures { get; set; } = new List<NewsPictures>();


}

