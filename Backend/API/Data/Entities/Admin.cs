using API.Entities;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities
{
    [Table("Admin")]
    public class Admin:User
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        // //public int PictureID { get; set; }
        // //[ForeignKey("PictureID")]
        // //public Picture Picture { get; set; }

        public List<News> News { get; set; }
    }
}