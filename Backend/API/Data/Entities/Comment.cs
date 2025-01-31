using API.Data.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

public class Comment
{
    [Key]
    public int ID { get; set; }  
    public required string Content { get; set; }
    public DateTime DateTime { get; set; }
    public int UserID { get; set; }
    [ForeignKey("UserID")]
    public User User { get; set; }


    public int NewsID { get; set; }
    [ForeignKey("NewsID")]
    
    public News News {get;set;}

    public int Like { get; set; }=0;
    public int Dislike { get; set; }=0;

     public ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();
}
