using API.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Data.Entities
{
    
    public class NewsPictures
    {
        [JsonIgnore]
        public int NewsID { get; set; }
        [JsonIgnore]
        public News News { get; set; }

        
        public int PictureID { get; set; }
        [ForeignKey("PictureID")]
        public Picture Picture { get; set; }

    }
}
