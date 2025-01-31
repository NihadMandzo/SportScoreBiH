using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using API.Data.Entities;

namespace API.Entities;

public class Player
{
    [Key]
    public int ID { get; set; }
    [Required]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Ime mora imati najmanje 3 karaktera.")]
    [RegularExpression(@"^[a-zA-ZčČćĆžŽšŠđĐ]+$", ErrorMessage = "Ime može sadržavati samo slova.")]
    public string FirstName { get; set; }
    [Required]
    [StringLength(100, MinimumLength = 4, ErrorMessage = "Prezime mora imati najmanje 4 karaktera.")]
    [RegularExpression(@"^[a-zA-ZčČćĆžŽšŠđĐ]+$", ErrorMessage = "Prezime može sadržavati samo slova.")]
    public string LastName { get; set; }
    [Required]
    public DateTime BirthDate { get; set; }


    //[JsonIgnore]
    //[IgnoreDataMember]
    [Required]
    [ForeignKey("ClubID")]
    public int ClubID { get; set; }


    public  Club Club { get; set; }


    
    public string Position { get; set; } 


    public Picture? Picture { get; set; }
    [ForeignKey("PictureID")]

    public int? PictureID { get; set; }

    
    //[JsonIgnore]
    //[IgnoreDataMember]
    //[ForeignKey("StatisticsID")]
    //public int? StatisticsID { get; set; }
    //public Statistics Statistics { get; set; }

    //public List<NewsPlayer> NewsPlayers { get; set; }
    //public List<PositionPlayer> PositionPlayers { get; set; }



}
