
using API.Data.Entities;
using API.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API.Data.Entities;

    [Table("NewsClub")]
    public class NewsClub
    {
        [JsonIgnore]
        public int NewsID { get; set; }
        [JsonIgnore]
        public News News { get; set; }
        [JsonIgnore]
        public int ClubID { get; set; }
        public Club Club { get; set; }
    }

