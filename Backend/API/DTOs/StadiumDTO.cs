using API.Data.Entities;

namespace API.DTOs
{
    public class StadiumDTO
    {
        public int ID { get; set; }
        public  string Name { get; set; }
        public int Capacity { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public List<Picture> StadiumPictures { get; set; }
    }
}
