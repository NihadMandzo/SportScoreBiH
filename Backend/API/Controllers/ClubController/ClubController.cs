using API.Controllers.AdminControllers;
using API.Data;
using API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace API.Controllers.ClubController
{

    [ApiController]
    [Route("api")]
    public class ClubController : ControllerBase
    {
        public readonly AppDbContext _context;
        public readonly ILogger<ClubController> _logger;


        public ClubController(AppDbContext context, ILogger<ClubController> logger)
        {
            _context = context;
            _logger = logger;
        }


        [HttpGet("club")]
        public async Task<ActionResult<IEnumerable<ClubDTO>>> GetClubs()
        {
            var clubs = await _context.Club
                .Include(c => c.Picture).
                Include(c => c.Stadium)
                .ThenInclude(c => c.StadiumPictures)
                .ThenInclude(sp => sp.Picture)
                 .Select(c => new ClubDTO
                 {
                     ID = c.ID,
                     Name = c.Name,
                     Info = c.Info,
                     PictureUrl = c.Picture.BlobUrl,
                     PhoneNumber = c.PhoneNumber,
                     Email = c.Email,
                     Facebook = c.Facebook,
                     Instagram = c.Instagram,
                     Stadium = new StadiumDTO
                     {
                         ID = c.Stadium.ID,
                         Name = c.Stadium.Name,
                         Capacity = c.Stadium.Capacity,
                         Latitude = c.Stadium.Latitude,
                         Longitude = c.Stadium.Longitude,
                         StadiumPictures = c.Stadium.StadiumPictures.Select(
                            sp => sp.Picture).ToList()
                     }
                 }).ToListAsync();

            if (!clubs.Any())
            {
                return NotFound("No clubs found.");
            }

            return Ok(clubs);
        }

        [HttpGet("club/{id}")]
        public async Task<ActionResult<ClubDTO>> GetClub(int id)
        {
            var club = await _context.Club
                .Include(c => c.Picture)  // Uključivanje slike kluba
                .Include(c => c.Stadium)
                .ThenInclude(c => c.StadiumPictures)
                .ThenInclude(sp => sp.Picture)
                .Where(c => c.ID == id)
                .Select(c => new ClubDTO
                {
                    ID = c.ID,
                    Name = c.Name,
                    Info = c.Info,
                    PictureUrl = c.Picture.BlobUrl,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Facebook = c.Facebook,
                    Instagram = c.Instagram,
                    Stadium = new StadiumDTO
                    {
                        ID = c.Stadium.ID,
                        Name = c.Stadium.Name,
                        Capacity = c.Stadium.Capacity,
                        Latitude = c.Stadium.Latitude,
                        Longitude = c.Stadium.Longitude,
                        StadiumPictures = c.Stadium.StadiumPictures.Select(
                            sp=>sp.Picture).ToList()
                    }
                }).FirstOrDefaultAsync();

            if (club == null)
            {
                return NotFound();
            }

            return Ok(club);
        }
    }
}