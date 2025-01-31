using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public enum RefereeType{
    Glavni=1,
    Pomocni,
    Cetvrti,
    VAR,
    VAR_Asistent       
}
// public class MatchReferee
// {

//         [Key]
//         public int ID { get; set; }
    
//         [ForeignKey("MatchID")]
//         public int MatchID { get; set; }
//         public Match Match { get; set; }

//         [ForeignKey("RefereeID")]
//         public int RefereeID { get; set; }
//         public Referee Referee { get; set; }

//         public RefereeType RefereeType { get; set; }
// }
