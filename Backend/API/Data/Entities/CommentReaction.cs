using System;
using System.ComponentModel.DataAnnotations.Schema;
using API.Entities;

namespace API.Data.Entities;

public class CommentReaction
{
    public int Id { get; set; }
    public bool IsLike { get; set; } // True za Like, False za Dislike


    public int CommentId { get; set; }
    [ForeignKey("CommentId")]
    public Comment Comment { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; }
}
