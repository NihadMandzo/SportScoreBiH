using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using API.Entities;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.Data.Entities;
public class Stadium
{
    [Key]
    public int ID { get; set; }
    public required string Name { get; set; }
    public int Capacity { get; set; }
    public float Latitude { get; set; }
    public float Longitude { get; set; }
    //public List<Club> Clubs { get; set; }

    //public List<Match> Matches { get; set; }

    public List<StadiumPictures> StadiumPictures { get; set; }
}
