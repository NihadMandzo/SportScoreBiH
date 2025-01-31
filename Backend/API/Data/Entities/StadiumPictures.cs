using API.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Data.Entities
{
    public class StadiumPictures
    {

        [Key]
        public int ID { get; set; }
        public int StadiumID { get; set; }
        [ForeignKey("StadiumID")]
        public Stadium Stadium { get; set; }

        public int PictureID { get; set; }
        [ForeignKey("PictureID")]

        public Picture Picture { get; set; }
    }
}
