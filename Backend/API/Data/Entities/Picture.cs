using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using API.Entities;

namespace API.Data.Entities
{
    public class Picture
    {
        [Key]
        public int ID { get; set; }
        public string BlobUrl { get; set; }  


        [JsonIgnore]
        public List<NewsPictures> NewsPictures { get; set; } = new List<NewsPictures>();
        public List<StadiumPictures> StadiumPictures { get; set; } = new List<StadiumPictures>();
    }
}
