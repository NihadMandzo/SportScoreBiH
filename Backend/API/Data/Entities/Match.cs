using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using API.Data.Entities;


namespace API.Entities;

// public class Match
// {
//     [Key]
//     public int ID { get; set; }

//     public int HomeTeamID{ get; set; }
//     [ForeignKey("HomeTeamID")]
    
//     public  Club HomeTeam { get; set; }
    
    
//     public int AwayTeamID { get; set; }
//     [ForeignKey("AwayTeamID")]
    
//     public  Club AwayTeam { get; set; }
    
//     public int StadiumID { get; set; }
//     [ForeignKey("StadiumID")]
    
//     public Stadium Stadium { get; set; }

//     public DateTime StartDate { get; set; } 
//     public int HomeTeamGoals { get; set; }
//     public int AwayTeamGoals { get; set; }

//     public List<MatchReferee> MatchReferees { get; set; }
   
//    public int MatchDayID { get; set; }
//    [ForeignKey("MatchDayID")]
//    public MatchDay Matchday { get; set; }

// }
