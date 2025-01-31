using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using API.Entities;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace API.Data.Entities;

public class Club
{
    [Key]
    public int ID { get; set; }
    public string Name { get; set; }
    public string Info { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string Facebook { get; set; }
    public string Instagram { get; set; }
    [JsonIgnore]
    public List<NewsClub>? NewsClubs { get; set; }



    [ForeignKey("PictureID")]
    [JsonIgnore]
    public int? PictureID { get; set; }
    [JsonIgnore]
    public Picture? Picture { get; set; }


    [ForeignKey("StadiumID")]
    [JsonIgnore]
    public int StadiumID { get; set; }
    [JsonIgnore]
    public Stadium Stadium { get; set; }

    public List<Player> Players { get; set; }

}
